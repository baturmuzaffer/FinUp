import db from '../config/db.js';
import redis from '../config/redis.js';
import { addLog } from '../queue/queue.js';
import { allocateFunds } from './investmentService.js';

/**
 * Yuvarlama Motorunun ana fonksiyonu.
 * Tek bir işlem görevini işler:
 * 1. Yuvarlama miktarını hesaplar.
 * 2. Kullanıcı banka bakiyesini doğrular.
 * 3. Kullanıcı banka bakiyesinden düşer ve bekleyen yuvarlama kaydeder.
 * 4. Redis havuz bakiyesini artırır.
 * 5. Limite ulaşıldığında yatırım dağıtımını tetikler.
 * 
 * @param {Object} job - { transactionId, userId, amount, merchant }
 */
export async function processRoundUpJob(job) {
  const { transactionId, userId, amount, merchant } = job;
  
  await addLog(`[Engine] Başlıyor... Tx ID: ${transactionId}, Kullanıcı ID: ${userId}, Harcama: ${amount} TL (${merchant})`);

  try {
    // 1. Kullanıcı profil yapılandırmasını getir
    const profileRes = await db.query(
      'SELECT risk_type, trigger_limit, exact_round_up FROM investment_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileRes.rows.length === 0) {
      await addLog(`[Engine Error] Kullanıcı ID ${userId} için yatırım profili bulunamadı!`);
      return;
    }

    const profile = profileRes.rows[0];
    const exactRoundUpSetting = parseFloat(profile.exact_round_up);
    const triggerLimit = parseFloat(profile.trigger_limit);

    // 2. Yuvarlama Miktarını Hesapla
    const floatAmount = parseFloat(amount);
    let roundUpAmount = 0;

    const remainder = floatAmount % 10;
    if (remainder === 0) {
      // Ör: 60.00 TL harcama, yapılandırılmış sabit miktara yuvarlanır (ör: 2.00 TL)
      roundUpAmount = exactRoundUpSetting;
      await addLog(`[Round-Up Engine] Tam 10'luk harcama algılandı (${floatAmount} TL). Sabit yuvarlama uygulandı: ${roundUpAmount} TL`);
    } else {
      // Ör: 64.30 TL harcama, 70.00 TL'ye yuvarlanır (fark = 5.70 TL)
      roundUpAmount = 10 - remainder;
      // Kayan nokta hassasiyet sorunlarını önlemek için 2 ondalık basamağa yuvarla
      roundUpAmount = parseFloat(roundUpAmount.toFixed(2));
      await addLog(`[Round-Up Engine] Harcama: ${floatAmount} TL. En yakın 10'luğa yuvarlama farkı: ${roundUpAmount} TL`);
    }

    if (roundUpAmount <= 0) {
      await addLog(`[Engine Skip] Yuvarlama miktarı 0 veya negatif. Atlanıyor.`);
      return;
    }

    // 3. Güvenlik için veritabanı işlemi içinde banka bakiyesini kontrol et ve güncelle (atomik kontrol-sonra-işlem)
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        'SELECT bank_balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (userRes.rows.length === 0) {
        throw new Error(`Kullanıcı bulunamadı (ID: ${userId})`);
      }

      const currentBankBalance = parseFloat(userRes.rows[0].bank_balance);

      // Yetersiz bakiye kontrolü!
      if (currentBankBalance < roundUpAmount) {
        await addLog(`[Engine Validation] Yetersiz Bakiye! Gereken yuvarlama: ${roundUpAmount} TL, Banka Kartı Bakiyesi: ${currentBankBalance} TL. Küsürat yuvarlama işlemi iptal edildi.`);
        
        // Başarısız yuvarlama kaydını kaydet
        await client.query(
          'INSERT INTO round_up_pool (user_id, transaction_id, round_up_amount, status) VALUES ($1, $2, $3, $4)',
          [userId, transactionId, roundUpAmount, 'FAILED_INSUFFICIENT']
        );
        
        await client.query('COMMIT');
        return;
      }

      // Yeterli bakiye: Simüle banka hesabından düş
      const newBankBalance = parseFloat((currentBankBalance - roundUpAmount).toFixed(2));
      await client.query(
        'UPDATE users SET bank_balance = $1 WHERE id = $2',
        [newBankBalance, userId]
      );

      // Bekleyen yuvarlama kaydını kaydet
      const poolInsertRes = await client.query(
        'INSERT INTO round_up_pool (user_id, transaction_id, round_up_amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, transactionId, roundUpAmount, 'PENDING']
      );

      await client.query('COMMIT');
      await addLog(`[Engine DB] Kullanıcı bakiyesinden ${roundUpAmount} TL düşüldü. Yeni bakiye: ${newBankBalance} TL. Havuz tablosuna ID ${poolInsertRes.rows[0].id} eklendi.`);

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 4. Redis Bakiye Takipçisini Güncelle (bellek içi önbellekleme)
    const redisPoolKey = `pool:user:${userId}`;
    // Redis'te havuz bakiyesini atomik olarak artır
    const newRedisPoolBalanceStr = await redis.incrbyfloat(redisPoolKey, roundUpAmount);
    const newRedisPoolBalance = parseFloat(parseFloat(newRedisPoolBalanceStr).toFixed(2));

    await addLog(`[Redis Cache] Havuz bakiyesi güncellendi (Redis). Yeni biriken: ${newRedisPoolBalance} TL / Limit: ${triggerLimit} TL`);

    // 5. Havuz tetik limitini aşarsa Yatırım Motorunu tetikle!
    if (newRedisPoolBalance >= triggerLimit) {
      await addLog(`[Trigger] Yatırım Limiti (${triggerLimit} TL) AŞILDI! Anlık havuz bakiyesi: ${newRedisPoolBalance} TL. Otomatik fon dağıtımı başlıyor...`);
      
      const success = await allocateFunds(userId, newRedisPoolBalance, profile.risk_type);
      
      if (success) {
        // Redis'te havuzu 0'a sıfırla
        await redis.set(redisPoolKey, '0');
        await addLog(`[System] Yatırım tamamlandı. Redis havuz bakiyesi 0.00 TL'ye sıfırlandı.`);
      } else {
        await addLog(`[System Error] Fon dağıtımı sırasında hata oluştu. Küsüratlar havuzda bekletilmeye devam edecek.`);
      }
    } else {
      await addLog(`[Engine] İşlem tamamlandı. Yatırım limitine kalan: ${(triggerLimit - newRedisPoolBalance).toFixed(2)} TL.`);
    }

  } catch (error) {
    console.error('Error in processRoundUpJob:', error);
    await addLog(`[Engine Error] Kritik hata: ${error.message}`);
  }
}
