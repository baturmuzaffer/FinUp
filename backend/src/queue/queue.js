import redis from '../config/redis.js';

const QUEUE_NAME = 'transaction_queue';
const LOG_KEY = 'finup:processing_logs';

/**
 * Redis kuyruğuna yeni bir işlem görevi ekler.
 * @param {Object} jobData - { transactionId, userId, amount, merchant }
 */
export async function addTransactionToQueue(jobData) {
  try {
    await redis.rpush(QUEUE_NAME, JSON.stringify(jobData));
    await addLog(`[Queue] Harcama kuyruğa eklendi. Tx ID: ${jobData.transactionId}, Miktar: ${jobData.amount} TL (${jobData.merchant})`);
  } catch (error) {
    console.error('Queue pushing error:', error);
    await addLog(`[Queue Error] Kuyruğa ekleme başarısız: ${error.message}`);
  }
}

/**
 * Gerçek zamanlı frontend görselleştirmesi için biçimlendirilmiş mühendislik log mesajını Redis'e ekler.
 * @param {string} message 
 */
export async function addLog(message) {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const formattedMsg = `[${timestamp}] ${message}`;
  console.log(formattedMsg);
  try {
    await redis.rpush(LOG_KEY, formattedMsg);
    // Sadece son 100 log mesajını tut
    await redis.ltrim(LOG_KEY, -100, -1);
  } catch (error) {
    console.error('Log writing error:', error);
  }
}

/**
 * Redis listesinden en son logları getirir.
 */
export async function getLatestLogs() {
  try {
    return await redis.lrange(LOG_KEY, 0, -1);
  } catch (error) {
    console.error('Failed to retrieve logs:', error);
    return [];
  }
}

/**
 * İşleri Redis'ten bloklu olarak çekip işlemek için worker döngüsünü başlatır.
 * @param {Function} processJob - her iş üzerinde çalıştırılacak asenkron fonksiyon
 */
export async function startWorker(processJob) {
  console.log('Yuvarlama Worker (Round-Up Worker) başlatıldı ve kuyruğu dinliyor...');
  await addLog('[System] Yuvarlama Worker (Round-Up Worker) aktif, kuyruk dinleniyor...');

  // Sonsuz worker döngüsünü başlat
  (async () => {
    while (true) {
      try {
        // BLPOP bağlantıyı bloklar. ioredis tek istemcide komut kuyruğu yönettiği için,
        // normal API çağrılarını engellememek adına BLPOP için ayrı bir istemci kullanılması önerilir.
        // Bloklu pop için özel bir istemci oluşturabiliriz.
        const redisBlockingClient = redis.duplicate();
        
        // Bir iş için en fazla 30 saniye bekle.
        // blpop [anahtar, değer] döndürür
        const result = await redisBlockingClient.blpop(QUEUE_NAME, 30);
        
        // Sızıntıyı önlemek için pop sonrası yinelenen istemci bağlantısını kapat
        await redisBlockingClient.quit();

        if (result && result.length > 1) {
          const jobData = JSON.parse(result[1]);
          await processJob(jobData);
        }
      } catch (error) {
        console.error('Worker loop error:', error);
        await addLog(`[Worker Error] Hata oluştu, worker yeniden bağlanıyor: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  })();
}
