import db from '../config/db.js';
import { addLog } from '../queue/queue.js';

// Static mock prices of assets in TL for realistic conversions
const ASSET_PRICES = {
  BTC: 3100000.00, // 1 Bitcoin = 3.100.000 TL
  ETH: 120000.00,  // 1 Ethereum = 120.000 TL
  STOCK: 500.00,   // 1 Tech Share = 500 TL
  GOLD: 2500.00,   // 1 Gram Gold = 2500 TL
  USD: 32.00,      // 1 US Dollar = 32 TL
};

// Asset types mappings
const ASSET_TYPES = {
  BTC: 'CRYPTO',
  ETH: 'CRYPTO',
  STOCK: 'STOCK',
  GOLD: 'GOLD',
  USD: 'FIAT',
};

// Risk profile allocation rules
const ALLOCATIONS = {
  CONSERVATIVE: [
    { asset: 'GOLD', percentage: 0.80 },
    { asset: 'USD', percentage: 0.20 },
  ],
  MODERATE: [
    { asset: 'STOCK', percentage: 0.40 },
    { asset: 'GOLD', percentage: 0.30 },
    { asset: 'USD', percentage: 0.30 },
  ],
  AGGRESSIVE: [
    { asset: 'BTC', percentage: 0.40 },
    { asset: 'ETH', percentage: 0.20 },
    { asset: 'STOCK', percentage: 0.40 },
  ],
};

/**
 * Automates risk-profile based fund distribution.
 * 1. Checks profile distribution percentages.
 * 2. Simulates purchasing assets at mock prices.
 * 3. Saves / updates user portfolio items in PostgreSQL.
 * 4. Marks all 'PENDING' user round-ups as 'INVESTED'.
 * 
 * @param {number} userId 
 * @param {number} amountToInvest 
 * @param {string} riskType - 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
 * @returns {Promise<boolean>} success status
 */
export async function allocateFunds(userId, amountToInvest, riskType) {
  const allocationRules = ALLOCATIONS[riskType] || ALLOCATIONS.MODERATE;
  
  await addLog(`[Investment Engine] Dağıtım Başladı. Miktar: ${amountToInvest} TL, Profil: ${riskType}`);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Loop through each rule to buy assets
    for (const rule of allocationRules) {
      const { asset, percentage } = rule;
      const assetPrice = ASSET_PRICES[asset];
      const assetType = ASSET_TYPES[asset];
      
      const investedTL = parseFloat((amountToInvest * percentage).toFixed(2));
      const purchasedQty = parseFloat((investedTL / assetPrice).toFixed(6));

      await addLog(`[Allocating] ${asset} (%${percentage * 100}) -> ${investedTL} TL ile ${purchasedQty} adet alındı. (Birim Fiyat: ${assetPrice} TL)`);

      // 2. Insert or update user portfolio
      const portfolioCheck = await client.query(
        'SELECT quantity, total_invested FROM user_portfolio WHERE user_id = $1 AND asset_name = $2',
        [userId, asset]
      );

      if (portfolioCheck.rows.length > 0) {
        // Update existing asset
        const existingQty = parseFloat(portfolioCheck.rows[0].quantity);
        const existingTotalInvested = parseFloat(portfolioCheck.rows[0].total_invested);
        
        const newQty = parseFloat((existingQty + purchasedQty).toFixed(6));
        const newTotalInvested = parseFloat((existingTotalInvested + investedTL).toFixed(2));
        const newAvgCost = parseFloat((newTotalInvested / newQty).toFixed(2));

        await client.query(
          `UPDATE user_portfolio 
           SET quantity = $1, total_invested = $2, average_cost = $3, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = $4 AND asset_name = $5`,
          [newQty, newTotalInvested, newAvgCost, userId, asset]
        );
      } else {
        // Insert new asset
        const avgCost = assetPrice;
        await client.query(
          `INSERT INTO user_portfolio (user_id, asset_name, asset_type, quantity, total_invested, average_cost) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, asset, assetType, purchasedQty, investedTL, avgCost]
        );
      }
    }

    // 3. Update all PENDING pool entries for this user to INVESTED
    const updatePoolRes = await client.query(
      `UPDATE round_up_pool 
       SET status = 'INVESTED' 
       WHERE user_id = $1 AND status = 'PENDING'`,
      [userId]
    );

    await client.query('COMMIT');
    await addLog(`[Investment Engine Success] Dağıtım başarıyla kaydedildi! ${updatePoolRes.rowCount} adet birikmiş işlem yatırıma dönüştürüldü.`);
    return true;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in allocateFunds:', error);
    await addLog(`[Investment Engine Error] Yatırım dağıtımı sırasında veri tabanı hatası: ${error.message}`);
    return false;
  } finally {
    client.release();
  }
}
