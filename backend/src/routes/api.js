import express from 'express';
import db from '../config/db.js';
import redis from '../config/redis.js';
import { addTransactionToQueue, getLatestLogs, addLog } from '../queue/queue.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// 1. Get User Profile and Redis Pool Balance
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const userRes = await db.query(
      'SELECT id, name, email, bank_balance FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const profileRes = await db.query(
      'SELECT risk_type, trigger_limit, exact_round_up FROM investment_profiles WHERE user_id = $1',
      [userId]
    );

    // Fetch pool balance from Redis cache
    const redisPoolKey = `pool:user:${userId}`;
    const redisVal = await redis.get(redisPoolKey);
    const poolBalance = redisVal ? parseFloat(redisVal) : 0.00;

    res.json({
      user: userRes.rows[0],
      profile: profileRes.rows[0] || null,
      poolBalance: parseFloat(poolBalance.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'İç sunucu hatası.' });
  }
});

// 2. Update Investment Profile Settings
router.post('/user/:id/profile', async (req, res) => {
  const userId = req.params.id;
  const { risk_type, trigger_limit, exact_round_up } = req.body;

  try {
    const checkUser = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    await db.query(
      `INSERT INTO investment_profiles (user_id, risk_type, trigger_limit, exact_round_up)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) 
       DO UPDATE SET risk_type = $2, trigger_limit = $3, exact_round_up = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, risk_type, trigger_limit, exact_round_up]
    );

    await addLog(`[Settings] Kullanıcı ayarları güncellendi. Profil: ${risk_type}, Limit: ${trigger_limit} TL, Tam Yuvarlama: ${exact_round_up} TL`);
    res.json({ message: 'Ayarlar başarıyla güncellendi.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'İç sunucu hatası.' });
  }
});

// 3. Simulate Sanal Kart Spend (Asynchronous flow start)
router.post('/spend', async (req, res) => {
  const { user_id, amount, merchant } = req.body;

  if (!user_id || !amount || !merchant) {
    return res.status(400).json({ error: 'Eksik parametreler: user_id, amount, merchant gereklidir.' });
  }

  try {
    // Check if user exists
    const userRes = await db.query('SELECT id, bank_balance FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const floatAmount = parseFloat(parseFloat(amount).toFixed(2));
    if (floatAmount <= 0) {
      return res.status(400).json({ error: 'Harcama miktarı sıfırdan büyük olmalıdır.' });
    }

    // A. Direct DB Write for the main transaction
    const txRes = await db.query(
      'INSERT INTO transactions (user_id, amount, merchant) VALUES ($1, $2, $3) RETURNING id',
      [user_id, floatAmount, merchant]
    );
    const transactionId = txRes.rows[0].id;

    // B. Queue pushing - starts async worker process
    await addTransactionToQueue({
      transactionId,
      userId: parseInt(user_id),
      amount: floatAmount,
      merchant
    });

    // Return HTTP 202 (Accepted) immediately
    res.status(202).json({
      message: 'Harcama kaydedildi, yuvarlama işlemi arka planda kuyruğa alındı.',
      transactionId
    });
  } catch (error) {
    console.error('Error creating spending:', error);
    res.status(500).json({ error: 'İç sunucu hatası.' });
  }
});

// 4. Get User Portfolio
router.get('/user/:id/portfolio', async (req, res) => {
  const userId = req.params.id;
  try {
    const portfolioRes = await db.query(
      'SELECT id, asset_name, asset_type, quantity, total_invested, average_cost, updated_at FROM user_portfolio WHERE user_id = $1 ORDER BY total_invested DESC',
      [userId]
    );
    res.json(portfolioRes.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'İç sunucu hatası.' });
  }
});

// 5. Get User Transactions (along with round-up info if any)
router.get('/user/:id/transactions', async (req, res) => {
  const userId = req.params.id;
  try {
    const txRes = await db.query(
      `SELECT t.id, t.amount, t.merchant, t.created_at, 
              r.round_up_amount, r.status as round_up_status
       FROM transactions t
       LEFT JOIN round_up_pool r ON t.id = r.transaction_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC 
       LIMIT 15`,
      [userId]
    );
    res.json(txRes.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'İç sunucu hatası.' });
  }
});

// 6. Get Real-Time Worker logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await getLatestLogs();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Hata oluştu.' });
  }
});

// 7. System Reset Utility (extremely helpful for demo runs)
router.post('/reset', async (req, res) => {
  try {
    console.log('System reset triggered. Clearing DB and Redis...');
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.query(sql);

    // Clear user redis key
    await redis.set('pool:user:1', '0');
    // Clear logs list
    await redis.del('finup:processing_logs');
    
    await addLog('[System] Sistem veritabanı ve Redis önbelleği sıfırlandı. Seeding tamamlandı.');
    res.json({ message: 'Sistem başarıyla sıfırlandı!' });
  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ error: 'Sistem sıfırlanamadı.' });
  }
});

export default router;
