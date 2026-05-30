import redis from '../config/redis.js';

const QUEUE_NAME = 'transaction_queue';
const LOG_KEY = 'finup:processing_logs';

/**
 * Pushes a new transaction task into the Redis queue.
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
 * Pushes a formatted engineering log message into Redis for real-time frontend visualization.
 * @param {string} message 
 */
export async function addLog(message) {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const formattedMsg = `[${timestamp}] ${message}`;
  console.log(formattedMsg);
  try {
    await redis.rpush(LOG_KEY, formattedMsg);
    // Keep only the last 100 log messages
    await redis.ltrim(LOG_KEY, -100, -1);
  } catch (error) {
    console.error('Log writing error:', error);
  }
}

/**
 * Retrieves the latest logs from the Redis list.
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
 * Starts the worker loop to block-pop jobs from Redis and process them.
 * @param {Function} processJob - async function to execute on each job
 */
export async function startWorker(processJob) {
  console.log('Yuvarlama Worker (Round-Up Worker) başlatıldı ve kuyruğu dinliyor...');
  await addLog('[System] Yuvarlama Worker (Round-Up Worker) aktif, kuyruk dinleniyor...');

  // Start the infinite worker loop
  (async () => {
    while (true) {
      try {
        // BLPOP blocks connection. Since ioredis handles command queuing on a single client,
        // using a separate client for BLPOP is recommended to avoid blocking normal API calls.
        // We can create a dedicated client for blocking pop.
        const redisBlockingClient = redis.duplicate();
        
        // Wait up to 30 seconds for a job.
        // blpop returns [key, value]
        const result = await redisBlockingClient.blpop(QUEUE_NAME, 30);
        
        // Close duplicate client connection after pop to prevent leak
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
