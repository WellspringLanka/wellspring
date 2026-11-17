import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useGRNLogic() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_grn_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [medForm, setMedForm] = useState({ id: null, name: '', unit_price: '' });
  const [savingMed, setSavingMed] = useState(false);

  const [statusBanner, setStatusBanner] = useState(null);
  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/grn/login`, { username: loginUsername, password: loginPassword });
      setLoggedInUser(res.data);
      sessionStorage.setItem('wellspring_grn_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) { setLoginError(err.response?.data?.error || 'Invalid credentials.'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('wellspring_grn_session');
    setLoggedInUser(null);
  };

  const fetchMedicines = useCallback(async () => {
    if (!loggedInUser) return;
    setLoadingMeds(true);
    try {
      const res = await axios.get(`${API_BASE}/counter/catalog`); // Reuse counter catalog route
      setMedicines(res.data.medicines || []);
    } catch (err) { showToast('Failed to load medicines.', 'error'); }
    finally { setLoadingMeds(false); }
  }, [loggedInUser]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    if (!medForm.name.trim() || !medForm.unit_price) return;
    setSavingMed(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/medicines/upsert`, { // Reuse counter upsert
        id: medForm.id,
        name: medForm.name.trim(),
        unit_price: parseFloat(medForm.unit_price)
      });
      showToast(`Medicine ${res.data.name} saved successfully.`);
      setMedForm({ id: null, name: '', unit_price: '' });
      fetchMedicines();
    } catch (err) { showToast('Failed to save medicine.', 'error'); }
    finally { setSavingMed(false); }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the catalog?`)) return;
    try {
      await axios.delete(`${API_BASE}/grn/medicines/${id}`);
      showToast(`${name} removed.`);
      fetchMedicines();
    } catch (err) { showToast('Failed to delete.', 'error'); }
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return {
    loggedInUser, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn, handleLogin, handleLogout,
    medicines: filteredMeds, loadingMeds, searchTerm, setSearchTerm,
    medForm, setMedForm, savingMed, handleSaveMedicine, handleDeleteMedicine, statusBanner
  };
}