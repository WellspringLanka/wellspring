import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useAdminPortalLogic() {
  const [loggedInAdmin, setLoggedInAdmin] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Tabs: 'dashboard', 'patients', 'log', 'users'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Financial & Demographic State
  const [dateFilter, setDateFilter] = useState('30D');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [financeSummary, setFinanceSummary] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0, totalPatients: 0 });
  const [financeChart, setFinanceChart] = useState([]);
  const [topMedicinesChart, setTopMedicinesChart] = useState([]);
  const [weeklyTrafficChart, setWeeklyTrafficChart] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);

  const [demographics, setDemographics] = useState({ bellCurveData: [], genderData: [], totalRegistered: 0 });
  const [loadingDemographics, setLoadingDemographics] = useState(false);

  // NEW: Daily Spreadsheet Log State
  const [logDate, setLogDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());
  });
  const [dailyLogList, setDailyLogList] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);

  // NEW: User Management State
  const [systemUsers, setSystemUsers] = useState({ doctors: [], cashiers: [] });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ role_type: 'DOCTOR', name: '', username: '', password: '', specialty_or_role: 'Consulting Physician' });
  const [registeringUser, setRegisteringUser] = useState(false);

  const [statusBanner, setStatusBanner] = useState(null);
  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { username: loginUsername, password: loginPassword });
      setLoggedInAdmin(res.data);
      sessionStorage.setItem('wellspring_admin_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) { setLoginError(err.response?.data?.error || 'Invalid credentials.'); }
    finally { setLoggingIn(false); }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('wellspring_admin_session');
    setLoggedInAdmin(null);
  };

  const getOffsetDate = (daysAgo) => {
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(d);
  };

  // FETCH: Dashboard Data
  const fetchFinancialData = useCallback(async () => {
    if (!loggedInAdmin) return;
    setLoadingFinance(true);
    try {
      let start = ''; let end = getOffsetDate(0);
      if (dateFilter === '7D') start = getOffsetDate(7);
      else if (dateFilter === '30D') start = getOffsetDate(30);
      else if (dateFilter === 'YTD') start = `${new Date().getFullYear()}-01-01`;
      else if (dateFilter === 'ALL') { start = ''; end = ''; }
      else if (dateFilter === 'CUSTOM') {
        start = customStart; end = customEnd;
        if (!start || !end) { setLoadingFinance(false); return; }
      }
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      const res = await axios.get(`${API_BASE}/admin/finance`, { params });
      setFinanceSummary(res.data.summary);
      setFinanceChart(res.data.chartData);
      setTopMedicinesChart(res.data.topMedicines);
      setWeeklyTrafficChart(res.data.weeklyTraffic);
    } catch (err) { console.error('Failed to load finance data'); } 
    finally { setLoadingFinance(false); }
  }, [loggedInAdmin, dateFilter, customStart, customEnd]);

  // FETCH: Demographics
  const fetchDemographics = useCallback(async () => {
    if (!loggedInAdmin) return;
    setLoadingDemographics(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/demographics`);
      setDemographics(res.data);
    } catch (err) { console.error('Failed to load demographics'); } 
    finally { setLoadingDemographics(false); }
  }, [loggedInAdmin]);

  // FETCH: Daily Log
  const fetchDailyLog = useCallback(async () => {
    if (!loggedInAdmin || !logDate) return;
    setLoadingLog(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/daily-log`, { params: { date: logDate } });
      
      // Assign Daily Bill Number visually (1, 2, 3...)
      const numberedList = (res.data || []).map((row, index) => ({
        ...row,
        daily_bill_no: index + 1
      }));
      setDailyLogList(numberedList);
    } catch (err) { showToast('Failed to load log.', 'error'); } 
    finally { setLoadingLog(false); }
  }, [loggedInAdmin, logDate]);

  // CSV EXPORT LOGIC
  const handleDownloadCSV = () => {
    if (dailyLogList.length === 0) return showToast('No data to download.', 'error');
    
    const headers = ['Time', 'Bill Number', 'Patient Name', 'Phone', 'Doctor', 'Status', 'Medicine Cost (Rs)', 'Final Revenue (Rs)', 'Profit (Rs)'];
    const rows = dailyLogList.map(row => {
      const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.created_at));
      const isOutdoor = row.bill_status === 'OUTDOOR_RX';
      const revenue = isOutdoor ? 0 : (row.final_total || 0);
      const cost = row.total_medicine_cost || 0;
      const profit = revenue - cost;

      return [
        time,
        row.daily_bill_no || row.id,
        `"${row.patient_names || ''}"`, // Quotes prevent commas in names from breaking columns
        row.patient_phone || 'None',
        `"${row.doctor_name || ''}"`,
        isOutdoor ? 'Outdoor (No Meds)' : 'Paid Bill',
        cost,
        revenue,
        profit
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Wellspring_Business_Log_${logDate}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FETCH: System Users
  const fetchSystemUsers = useCallback(async () => {
    if (!loggedInAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/users`);
      setSystemUsers(res.data);
    } catch (err) { showToast('Failed to load users.', 'error'); } 
    finally { setLoadingUsers(false); }
  }, [loggedInAdmin]);

  // REGISTER USER
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegisteringUser(true);
    try {
      await axios.post(`${API_BASE}/admin/users`, newUserForm);
      showToast(`${newUserForm.role_type} created successfully!`);
      setNewUserForm({ role_type: 'DOCTOR', name: '', username: '', password: '', specialty_or_role: 'Consulting Physician' });
      fetchSystemUsers();
    } catch (err) { showToast(err.response?.data?.error || 'Registration failed.', 'error'); } 
    finally { setRegisteringUser(false); }
  };

  // DELETE USER
  const handleDeleteUser = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the system?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${type}/${id}`);
      showToast(`User ${name} removed.`);
      fetchSystemUsers();
    } catch (err) { showToast('Failed to delete user.', 'error'); }
  };

  // Routing Effect
  useEffect(() => {
    if (activeTab === 'dashboard') fetchFinancialData();
    if (activeTab === 'patients') fetchDemographics();
    if (activeTab === 'log') fetchDailyLog();
    if (activeTab === 'users') fetchSystemUsers();
  }, [activeTab, dateFilter, logDate, fetchFinancialData, fetchDemographics, fetchDailyLog, fetchSystemUsers]);

  return {
    loggedInAdmin, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleAdminLogin, handleAdminLogout,
    activeTab, setActiveTab, statusBanner,
    dateFilter, setDateFilter, customStart, setCustomStart, customEnd, setCustomEnd,
    financeSummary, financeChart, topMedicinesChart, weeklyTrafficChart, loadingFinance,
    demographics, loadingDemographics,
    logDate, setLogDate, dailyLogList, loadingLog, handleDownloadCSV,
    systemUsers, loadingUsers, newUserForm, setNewUserForm, registeringUser, handleRegisterUser, handleDeleteUser
  };
}