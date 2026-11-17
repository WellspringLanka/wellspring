import { Link } from 'react-router-dom';
import { useAdminPortalLogic } from './adminLogic';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './DoctorPortal.css'; 
import './AdminPortal.css';

export default function AdminPortal() {
  const {
    loggedInAdmin, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleAdminLogin, handleAdminLogout,
    activeTab, setActiveTab,
    dateFilter, setDateFilter, customStart, setCustomStart, customEnd, setCustomEnd,
    financeSummary, financeChart, topMedicinesChart, weeklyTrafficChart, loadingFinance,
    demographics, loadingDemographics
  } = useAdminPortalLogic();

  if (!loggedInAdmin) {
    return (
      <div className="doctor-login-wrapper" style={{ background: '#020617' }}>
        <div className="login-card" style={{ background: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}>
          <div className="login-header">
            <div className="login-brand-script" style={{ color: '#2dd4bf' }}>Wellspring</div>
            <span className="login-badge" style={{ background: '#134e4a', color: '#5eead4' }}>Admin Command Center</span>
            <h1 style={{ color: '#f8fafc' }}>System Login</h1>
          </div>
          {loginError && <div className="login-error-msg">{loginError}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="login-form-group">
              <label style={{ color: '#94a3b8' }}>Admin Username</label>
              <input type="text" required className="login-input" style={{ background: '#020617', color: '#fff', borderColor: '#334155' }} value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoFocus />
            </div>
            <div className="login-form-group">
              <label style={{ color: '#94a3b8' }}>Password</label>
              <input type="password" required className="login-input" style={{ background: '#020617', color: '#fff', borderColor: '#334155' }} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loggingIn} className="login-submit-btn" style={{ background: '#0f766e' }}>
              {loggingIn ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
          <Link to="/" className="login-back-link" style={{ color: '#cbd5e1' }}>← Return to Home</Link>
        </div>
      </div>
    );
  }

  const FinanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#94a3b8' }}>{label}</p>
          <p style={{ margin: '4px 0', color: '#38bdf8', fontWeight: 600 }}>Revenue: Rs. {payload[0].value.toFixed(2)}</p>
          <p style={{ margin: '4px 0', color: '#f87171', fontWeight: 600 }}>Medicine Cost: Rs. {payload[1].value.toFixed(2)}</p>
          <p style={{ margin: '4px 0', color: '#10b981', fontWeight: 800 }}>Net Profit: Rs. {payload[2].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-portal-wrapper">
      <header className="admin-topbar">
        <div className="admin-brand-group">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="admin-logo-text">Wellspring</span>
          </Link>
          <span className="admin-badge">Admin Analytics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>
            Logged in as: <span style={{ color: '#fff' }}>{loggedInAdmin.name}</span>
          </div>
          <button type="button" onClick={handleAdminLogout} className="doc-logout-btn" style={{ background: '#1e293b', borderColor: '#334155' }}>
            Secure Logout
          </button>
        </div>
      </header>

      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <button className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Financial &amp; Clinic Dashboard
          </button>
          <button className={`admin-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            👥 Patient Demographics
          </button>
          <div style={{ marginTop: 'auto', padding: '10px', fontSize: '0.8rem', color: '#475569', textAlign: 'center' }}>
            Log and Registration modules ready for next deployment.
          </div>
        </aside>

        <main className="admin-content-area">
          {activeTab === 'dashboard' && (
            <div className="admin-filter-bar">
              <div className="filter-btn-group">
                <button className={`filter-tab ${dateFilter === '7D' ? 'active' : ''}`} onClick={() => setDateFilter('7D')}>Last 7 Days</button>
                <button className={`filter-tab ${dateFilter === '30D' ? 'active' : ''}`} onClick={() => setDateFilter('30D')}>Last 30 Days</button>
                <button className={`filter-tab ${dateFilter === 'YTD' ? 'active' : ''}`} onClick={() => setDateFilter('YTD')}>Year to Date</button>
                <button className={`filter-tab ${dateFilter === 'ALL' ? 'active' : ''}`} onClick={() => setDateFilter('ALL')}>All Time (2015-Now)</button>
                <button className={`filter-tab ${dateFilter === 'CUSTOM' ? 'active' : ''}`} onClick={() => setDateFilter('CUSTOM')}>Custom Range</button>
              </div>

              {dateFilter === 'CUSTOM' && (
                <div className="custom-date-inputs">
                  <input type="date" className="admin-date-input" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                  <span style={{ color: '#64748b' }}>to</span>
                  <input type="date" className="admin-date-input" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* TAB 1: FINANCIAL DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Gross Revenue (Cash Collected)</div>
                  <div className="kpi-value">Rs. {financeSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Raw Medicine Cost (Expenses)</div>
                  <div className="kpi-value" style={{ color: '#f87171' }}>Rs. {financeSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="kpi-card profit">
                  <div className="kpi-title">Net Clinic Profit</div>
                  <div className="kpi-value">Rs. {financeSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Dispensary Patients Served</div>
                  <div className="kpi-value" style={{ color: '#a78bfa' }}>{financeSummary.totalPatients.toLocaleString()}</div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">Revenue vs Profit Trajectory {loadingFinance && <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '10px' }}>Loading...</span>}</div>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={financeChart} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `Rs.${value/1000}k`} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="cost" name="Cost" stroke="#f87171" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* NEW ADVANCED CHARTS (Top Medicines & Daily Traffic) */}
              <div className="advanced-charts-grid">
                <div className="secondary-chart-card">
                  <div className="chart-header">Top 7 Most Dispensed Medicines</div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart layout="vertical" data={topMedicinesChart} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="total_sold" name="Units Sold" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="secondary-chart-card">
                  <div className="chart-header">Clinic Busyness by Day of Week</div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={weeklyTrafficChart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" />
                      <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="visits" name="Total Patient Visits" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PATIENT ANALYTICS */}
          {activeTab === 'patients' && (
            <div className="demographics-grid">
              
              {/* HISTOGRAM (BELL CURVE) - NOW INCLUDES 0-5 YR OLD BABIES */}
              <div className="chart-card">
                <div className="chart-header">Patient Age Demographics (Bell Curve) {loadingDemographics && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Loading...</span>}</div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={demographics.bellCurveData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="ageGroup" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="patients" name="Total Patients" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* PIE CHART - NOW INCLUDES 'NOT SPECIFIED' */}
              <div className="chart-card">
                <div className="chart-header">Gender Distribution</div>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie data={demographics.genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {demographics.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>■ Male</span> &nbsp;&nbsp; 
                  <span style={{ color: '#f472b6', fontWeight: 800 }}>■ Female</span> &nbsp;&nbsp;
                  <span style={{ color: '#64748b', fontWeight: 800 }}>■ Not Specified</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>
                  Total Master Records: {demographics.totalRegistered.toLocaleString()}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}