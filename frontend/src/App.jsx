import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  Settings, 
  Terminal, 
  PieChart, 
  Activity, 
  DollarSign, 
  Zap, 
  RefreshCw, 
  User, 
  Coins,
  ArrowRight,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Error Boundary to prevent blank screens from runtime errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#fca5a5', background: '#0f121c', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>⚠️ Uygulama Hatası</h2>
          <pre style={{ marginTop: '1rem', color: '#94a3b8' }}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#00f2fe', color: '#020617', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Sayfayı Yenile</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // Application State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userStats, setUserStats] = useState({
    user: { id: 1, name: 'Yükleniyor...', email: '', bank_balance: 0.00 },
    profile: { risk_type: 'MODERATE', trigger_limit: 50.00, exact_round_up: 2.00 },
    poolBalance: 0.00
  });
  
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Spend Simulator Inputs
  const [spendAmount, setSpendAmount] = useState('64.30');
  const [spendMerchant, setSpendMerchant] = useState('Starbucks Coffee');
  const [spendLoading, setSpendLoading] = useState(false);
  const [spendMessage, setSpendMessage] = useState('');
  
  // Settings Inputs
  const [riskType, setRiskType] = useState('MODERATE');
  const [triggerLimit, setTriggerLimit] = useState('50');
  const [exactRoundUp, setExactRoundUp] = useState('2');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  
  // System Reset Loading
  const [resetLoading, setResetLoading] = useState(false);
  
  // Auto-scroll terminal logs reference
  const terminalEndRef = useRef(null);

  // Load dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
    
    // Set up continuous polling every 1.5 seconds for real-time responsiveness
    const pollInterval = setInterval(() => {
      pollRealTimeUpdates();
    }, 1500);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync settings inputs when user profile loads
  useEffect(() => {
    if (userStats.profile) {
      setRiskType(userStats.profile.risk_type);
      setTriggerLimit(userStats.profile.trigger_limit.toString());
      setExactRoundUp(userStats.profile.exact_round_up.toString());
    }
  }, [userStats.profile]);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch all initial data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, portfolioRes, txRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/user/1`),
        fetch(`${API_URL}/user/1/portfolio`),
        fetch(`${API_URL}/user/1/transactions`),
        fetch(`${API_URL}/logs`)
      ]);
      
      if (!statsRes.ok || !portfolioRes.ok || !txRes.ok || !logsRes.ok) {
        throw new Error('Sistem verileri yüklenemedi. Docker servislerinin çalıştığından emin olun.');
      }
      
      const stats = await statsRes.json();
      const port = await portfolioRes.json();
      const tx = await txRes.json();
      const lg = await logsRes.json();
      
      setUserStats(stats);
      setPortfolio(port);
      setTransactions(tx);
      setLogs(lg.logs || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll for logs and balances without showing global spinner
  const pollRealTimeUpdates = async () => {
    try {
      const [statsRes, portfolioRes, txRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/user/1`),
        fetch(`${API_URL}/user/1/portfolio`),
        fetch(`${API_URL}/user/1/transactions`),
        fetch(`${API_URL}/logs`)
      ]);

      if (statsRes.ok && portfolioRes.ok && txRes.ok && logsRes.ok) {
        const stats = await statsRes.json();
        const port = await portfolioRes.json();
        const tx = await txRes.json();
        const lg = await logsRes.json();
        
        setUserStats(stats);
        setPortfolio(port);
        setTransactions(tx);
        setLogs(lg.logs || []);
      }
    } catch (err) {
      // Fail silently during background polling to prevent distracting error overlays
      console.warn('Background poll failed:', err.message);
    }
  };

  // Simulate spending submission
  const handleSpendSubmit = async (e) => {
    e.preventDefault();
    setSpendLoading(true);
    setSpendMessage('');
    
    try {
      const response = await fetch(`${API_URL}/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          amount: parseFloat(spendAmount),
          merchant: spendMerchant
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'İşlem başarısız.');

      setSpendMessage('✅ Harcama yapıldı! Yuvarlama motoru devreye girdi.');
      // Instantly trigger polling update
      pollRealTimeUpdates();
    } catch (err) {
      setSpendMessage(`❌ Hata: ${err.message}`);
    } finally {
      setSpendLoading(false);
    }
  };

  // Update Settings Profile
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');
    
    try {
      const response = await fetch(`${API_URL}/user/1/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_type: riskType,
          trigger_limit: parseFloat(triggerLimit),
          exact_round_up: parseFloat(exactRoundUp)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Güncelleme başarısız.');

      setSettingsMessage('✅ Yatırım ayarları başarıyla güncellendi.');
      pollRealTimeUpdates();
    } catch (err) {
      setSettingsMessage(`❌ Hata: ${err.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Reset entire simulator to original seed
  const handleSystemReset = async () => {
    if (!window.confirm('Veritabanını sıfırlamak ve tüm işlemlerinizi temizlemek istediğinize emin misiniz?')) return;
    
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
      if (!response.ok) throw new Error('Sıfırlama başarısız.');
      
      alert('Sistem başarıyla sıfırlandı! Başlangıç verileri yeniden yüklendi.');
      fetchDashboardData();
    } catch (err) {
      alert(`Sıfırlama hatası: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  // ChartJS Data setup
  const chartData = {
    labels: portfolio.map(item => item.asset_name),
    datasets: [
      {
        data: portfolio.map(item => parseFloat(item.total_invested)),
        backgroundColor: [
          '#00f2fe', // BTC: Cyan
          '#d946ef', // ETH: Purple/Pink
          '#f59e0b', // STOCK: Amber
          '#10b981', // GOLD: Green
          '#4facfe', // USD: Blue
        ],
        borderColor: 'rgba(15, 18, 28, 0.9)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} TL`
        }
      }
    },
    maintainAspectRatio: false
  };

  const totalPortfolioValue = portfolio.reduce((acc, item) => acc + parseFloat(item.total_invested), 0);
  const poolLimit = userStats.profile ? parseFloat(userStats.profile.trigger_limit) : 50.00;
  const poolPercent = Math.min((userStats.poolBalance / poolLimit) * 100, 100);

  if (loading && !userStats.user.email) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <RefreshCw size={48} className="neon-text" style={{ animation: 'spin 2s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-main)', color: 'var(--text-secondary)' }}>FinUp Altyapısı Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. Header Section */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="logo-text neon-text">FinUp</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>AUTOMATED MICRO-INVESTING</p>
          </div>
        </div>
        
        <div className="user-status">
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
            <User size={16} className="neon-text" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{userStats.user.name}</span>
          </div>
          <button 
            className="btn btn-danger" 
            style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}
            onClick={handleSystemReset}
            disabled={resetLoading}
          >
            <RefreshCw size={14} style={{ animation: resetLoading ? 'spin 1s linear infinite' : 'none' }} />
            Sıfırla
          </button>
        </div>
      </header>

      {error && (
        <div className="glass-panel glow-accent" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', marginBottom: '2rem', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ Sistem Bağlantı Hatası</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>
          <button className="btn" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)' }} onClick={fetchDashboardData}>Yeniden Dene</button>
        </div>
      )}

      {/* 2. Stats Dashboard Cards */}
      <div className="stats-container">
        {/* Card 1: Bank Balance */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Simüle Banka Kartı Bakiyesi</span>
            <div className="stat-icon" style={{ background: 'rgba(79, 172, 254, 0.15)', color: '#4facfe' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#4facfe' }}>
            {parseFloat(userStats.user.bank_balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.25rem' }}>TL</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Alışveriş yaptıkça bu bakiyeden çekilir</p>
        </div>

        {/* Card 2: Round-Up Pool */}
        <div className="glass-panel stat-card glow-primary">
          <div className="stat-header">
            <span>Yatırım Havuzunda Biriken</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#00f2fe' }}>
            {userStats.poolBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.25rem' }}>TL</span>
          </div>
          
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Limit: {poolLimit} TL</span>
              <span>%{Math.round(poolPercent)}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${poolPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Portfolio Valuation */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Toplam Yatırım Portföyü</span>
            <div className="stat-icon" style={{ background: 'rgba(219, 70, 239, 0.15)', color: '#d946ef' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d946ef' }}>
            {totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.25rem' }}>TL</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Otomatik alımlarla büyüyen birikiminiz</p>
        </div>

        {/* Card 4: Active Risk Profile */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Aktif Risk Profili</span>
            <div className="stat-icon" style={{ 
              background: userStats.profile?.risk_type === 'AGGRESSIVE' ? 'rgba(239, 68, 68, 0.15)' : userStats.profile?.risk_type === 'MODERATE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
              color: userStats.profile?.risk_type === 'AGGRESSIVE' ? '#ef4444' : userStats.profile?.risk_type === 'MODERATE' ? '#f59e0b' : '#10b981'
            }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ 
            color: userStats.profile?.risk_type === 'AGGRESSIVE' ? '#ef4444' : userStats.profile?.risk_type === 'MODERATE' ? '#f59e0b' : '#10b981',
            fontSize: '1.50rem',
            marginTop: '0.75rem'
          }}>
            {userStats.profile?.risk_type === 'AGGRESSIVE' && '🔥 Agresif'}
            {userStats.profile?.risk_type === 'MODERATE' && '⚖️ Dengeli'}
            {userStats.profile?.risk_type === 'CONSERVATIVE' && '🛡️ Muhafazakar'}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Limit aşıldığında bu şablonla alım yapılır</p>
        </div>
      </div>

      {/* 3. Operational Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Simulators and Settings */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Box A: Spending Simulator */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CreditCard className="neon-text" size={20} />
              Sanal Kart Harcama Simülatörü
            </h3>
            
            <form onSubmit={handleSpendSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="merchant">İşyeri (Merchant)</label>
                  <input 
                    type="text" 
                    id="merchant"
                    className="form-control"
                    placeholder="E.g., Starbucks"
                    value={spendMerchant}
                    onChange={(e) => setSpendMerchant(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="amount">Harcama Tutarı (TL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    id="amount"
                    className="form-control"
                    placeholder="64.30"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Yuvarlanacak: <strong style={{ color: '#00f2fe' }}>
                    {spendAmount ? (spendAmount % 10 === 0 ? parseFloat(exactRoundUp).toFixed(2) : (10 - (spendAmount % 10)).toFixed(2)) : '0.00'} TL
                  </strong>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={spendLoading}
                >
                  {spendLoading ? 'İşleniyor...' : 'Simüle Harcama Yap'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
            
            {spendMessage && (
              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.875rem', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: spendMessage.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: spendMessage.includes('❌') ? '#fca5a5' : '#a7f3d0',
                border: spendMessage.includes('❌') ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                {spendMessage}
              </div>
            )}
          </div>

          {/* Box B: Investment Settings */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Settings className="neon-text" size={20} />
              Otomatik Yatırım ve Profil Ayarları
            </h3>
            
            <form onSubmit={handleSettingsSubmit}>
              <div className="form-group">
                <label htmlFor="riskType">Yatırım Risk Profili</label>
                <select 
                  id="riskType" 
                  className="form-control form-select"
                  value={riskType}
                  onChange={(e) => setRiskType(e.target.value)}
                >
                  <option value="CONSERVATIVE">🛡️ Muhafazakar Profil (%80 Altın, %20 Döviz)</option>
                  <option value="MODERATE">⚖️ Dengeli Profil (%40 Hisse, %30 Altın, %30 Döviz)</option>
                  <option value="AGGRESSIVE">🔥 Agresif Profil (%40 BTC, %20 ETH, %40 Hisse)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="triggerLimit">Yatırım Tetik Limiti (TL)</label>
                  <input 
                    type="number" 
                    id="triggerLimit"
                    className="form-control"
                    value={triggerLimit}
                    onChange={(e) => setTriggerLimit(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="exactRoundUp">Tam 10'luk Sabit Yuvarlama (TL)</label>
                  <input 
                    type="number" 
                    id="exactRoundUp"
                    className="form-control"
                    value={exactRoundUp}
                    onChange={(e) => setExactRoundUp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ background: 'rgba(0, 242, 254, 0.1)', borderColor: 'rgba(0, 242, 254, 0.3)', color: '#00f2fe' }}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
                  <ShieldCheck size={16} />
                </button>
              </div>
            </form>

            {settingsMessage && (
              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.875rem', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#a7f3d0',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                {settingsMessage}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Live Logs Dashboard Console */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Terminal className="neon-text" size={20} />
              Yuvarlama Servisi Asenkron Log Paneli
            </h3>
            
            <div className="terminal-container" style={{ flexGrow: 1 }}>
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem', fontStyle: 'italic' }}>
                  Kuyruk Worker'ı beklemede. Harcama yaptığınızda kuyruk logs burada akacaktır...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="terminal-line">
                    {log}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
            
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                Kuyruk: Aktif (Redis LPUSH/BRPOP)
              </span>
              <span>Worker Gecikmesi: &lt; 50ms</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Portfolio Graph & Investment Allocation Details */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Box C: Portfolio Chart */}
        <div className="col-7">
          <div className="glass-panel portfolio-flex" style={{ minHeight: '260px' }}>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <PieChart className="neon-text" size={20} />
                Yatırım Varlıkları Portföyü
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Harcamalarınızdan biriken paraların risk profilinize göre dağılımı.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {portfolio.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Henüz yatırım alımı yapılmadı.</p>
                ) : (
                  portfolio.map((item, idx) => {
                    const colors = ['#00f2fe', '#d946ef', '#f59e0b', '#10b981', '#4facfe'];
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[idx % 5] }}></span>
                          <strong>{item.asset_name}</strong> 
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.asset_type})</span>
                        </div>
                        <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{ fontWeight: 600 }}>{parseFloat(item.quantity).toFixed(6)} adet</span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }}>({parseFloat(item.total_invested).toFixed(2)} TL)</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="chart-wrapper">
              {portfolio.length > 0 ? (
                <>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yatırılan</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{Math.round(totalPortfolioValue)} TL</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Grafik Yok</div>
              )}
            </div>
          </div>
        </div>

        {/* Box D: Transactions history and Round-up pools */}
        <div className="col-5">
          <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Activity className="neon-text" size={20} />
              Son Harcamalar & Yuvarlama Durumları
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Hesabınızdan geçen son işlemler ve kuyruk durumu.
            </p>

            <div className="list-container" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '180px' }}>
              {transactions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
                  Henüz işlem geçmişi yok.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="list-item">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.merchant}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.created_at).toLocaleTimeString('tr-TR')} - {parseFloat(tx.amount).toFixed(2)} TL
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#00f2fe' }}>
                          +{tx.round_up_amount ? parseFloat(tx.round_up_amount).toFixed(2) : '0.00'} TL
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>küsürat</div>
                      </div>
                      
                      <div>
                        {tx.round_up_status === 'INVESTED' && <span className="badge badge-invested">Yatırıldı</span>}
                        {tx.round_up_status === 'PENDING' && <span className="badge badge-pending">Beklemede</span>}
                        {tx.round_up_status === 'FAILED_INSUFFICIENT' && <span className="badge badge-failed" title="Yetersiz bakiye nedeniyle iptal edildi">İptal</span>}
                        {!tx.round_up_status && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>İşleniyor</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      
      {/* 5. Footer and Technical Credits */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>FinUp // Küsürat Yuvarlama ve Otomatik Fon Dağıtım Simülasyonu - Mühendislik Projesi</p>
        <p style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>Node.js • Express • PostgreSQL • Redis (Worker List Queue) • React + Vite • Docker Compose</p>
      </footer>
    </div>
  );
}

// Wrap App with ErrorBoundary for resilient rendering
export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
