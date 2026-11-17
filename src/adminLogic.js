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

  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [dateFilter, setDateFilter] = useState('30D');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [financeSummary, setFinanceSummary] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0, totalPatients: 0 });
  const [financeChart, setFinanceChart] = useState([]);
  
  // NEW: State for Top Medicines and Day of Week Traffic
  const [topMedicinesChart, setTopMedicinesChart] = useState([]);
  const [weeklyTrafficChart, setWeeklyTrafficChart] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);

  const [demographics, setDemographics] = useState({ bellCurveData: [], genderData: [], totalRegistered: 0 });
  const [loadingDemographics, setLoadingDemographics] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { username: loginUsername, password: loginPassword });
      setLoggedInAdmin(res.data);
      sessionStorage.setItem('wellspring_admin_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('wellspring_admin_session');
    setLoggedInAdmin(null);
  };

  const getOffsetDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(d);
  };

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
    } catch (err) {
      console.error('Failed to load finance data');
    } finally {
      setLoadingFinance(false);
    }
  }, [loggedInAdmin, dateFilter, customStart, customEnd]);

  const fetchDemographics = useCallback(async () => {
    if (!loggedInAdmin) return;
    setLoadingDemographics(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/demographics`);
      setDemographics(res.data);
    } catch (err) {
      console.error('Failed to load demographics');
    } finally {
      setLoadingDemographics(false);
    }
  }, [loggedInAdmin]);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchFinancialData();
    if (activeTab === 'patients') fetchDemographics();
  }, [activeTab, dateFilter, fetchFinancialData, fetchDemographics]);

  return {
    loggedInAdmin, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleAdminLogin, handleAdminLogout,
    activeTab, setActiveTab,
    dateFilter, setDateFilter, customStart, setCustomStart, customEnd, setCustomEnd,
    financeSummary, financeChart, topMedicinesChart, weeklyTrafficChart, loadingFinance,
    demographics, loadingDemographics
  };
}