import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const DOCTOR_THEMES = [
  { id: 'ocean', name: 'Ocean Medical Blue', swatch: '#0284c7' },
  { id: 'navy', name: 'Royal Hospital Navy', swatch: '#1e3a8a' },
  { id: 'teal', name: 'Clinical Teal', swatch: '#0f766e' },
  { id: 'indigo', name: 'Modern Slate Indigo', swatch: '#3730a3' }
];

export function calculateAge(birthDateString) {
  if (!birthDateString) return 'Not Recorded';
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 'Not Recorded';

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years < 1) {
    return `${Math.max(0, months)} Months`;
  }
  return `${years} Years`;
}

export function formatClearDate(dateString) {
  if (!dateString) return 'Not Recorded';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function useDoctorPortalLogic() {
  // Defaulting to "Clinical Teal" as requested
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('wellspring_doc_theme') || 'teal';
  });

  useEffect(() => {
    localStorage.setItem('wellspring_doc_theme', activeTheme);
  }, [activeTheme]);

  const [loggedInDoctor, setLoggedInDoctor] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_doctor_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [sidebarTab, setSidebarTab] = useState('queue');
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  // Upgraded Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    birth_date: '',
    phone: '',
    id_number: '',
    gender: '1', // 1 = Male, 2 = Female
    married: '0', // 0 = No, 1 = Yes
    weight: '',
    height: '',
    common: ''
  });
  const [creatingPatient, setCreatingPatient] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [commonText, setCommonText] = useState('');
  const [isEditingCommon, setIsEditingCommon] = useState(false);
  const [savingCommon, setSavingCommon] = useState(false);

  const [allergiesText, setAllergiesText] = useState('');
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  const [savingAllergies, setSavingAllergies] = useState(false);

  const [prescriptionText, setPrescriptionText] = useState(() => {
    return sessionStorage.getItem('draft_rx_general') || '';
  });
  const [remarksText, setRemarksText] = useState('');
  const [submittingRx, setSubmittingRx] = useState(false);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);

  const [bellRinging, setBellRinging] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 3500);
  };

  useEffect(() => {
    sessionStorage.setItem('draft_rx_general', prescriptionText);
  }, [prescriptionText]);

  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/doctor/login`, {
        username: loginUsername,
        password: loginPassword
      });
      setLoggedInDoctor(res.data);
      sessionStorage.setItem('wellspring_doctor_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Unable to sign in. Check your credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleDoctorLogout = () => {
    sessionStorage.removeItem('wellspring_doctor_session');
    setLoggedInDoctor(null);
    setSelectedPatient(null);
    setActiveTicketId(null);
  };

  const fetchQueue = useCallback(async () => {
    if (!loggedInDoctor) return;
    setLoadingQueue(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/queue`);
      setQueueList(res.data || []);
    } catch (err) {
      console.error('Failed to load queue:', err.message);
    } finally {
      setLoadingQueue(false);
    }
  }, [loggedInDoctor]);

  useEffect(() => {
    if (!loggedInDoctor) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue, loggedInDoctor]);

  const selectPatientForConsultation = async (patientObj, ticketId = null) => {
    if (!patientObj || !patientObj.id) return;
    setLoadingProfile(true);
    setIsEditingCommon(false);
    setIsEditingAllergies(false);
    setActiveTicketId(ticketId);

    try {
      const res = await axios.get(`${API_BASE}/patients/${patientObj.id}/consultation`);
      const { patient, allergiesAndReports, prescriptionHistory: history } = res.data;
      setSelectedPatient(patient);
      setCommonText(patient.common || '');
      setAllergiesText(allergiesAndReports || '');
      setPrescriptionHistory(history || []);
    } catch (err) {
      setSelectedPatient(patientObj);
      setCommonText(patientObj.common || '');
      setAllergiesText('');
      setPrescriptionHistory([]);
      showToast('Could not fetch complete patient history.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSearchPatients = async (pageToLoad = 1, customQuery = searchQuery) => {
    const q = customQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`${API_BASE}/patients/search`, { params: { q, page: pageToLoad } });
      if (pageToLoad === 1) setSearchResults(res.data.data || []);
      else setSearchResults(prev => [...prev, ...(res.data.data || [])]);
      setSearchPage(pageToLoad);
      setHasMoreSearch(res.data.hasMore);
    } catch (err) {
      showToast('Search failed.', 'error');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (sidebarTab !== 'search') return;
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) handleSearchPatients(1, searchQuery);
      else if (searchQuery.trim().length === 0) setSearchResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sidebarTab]);

  const handleCreateWalkInPatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) {
      showToast('Patient name is required.', 'error');
      return;
    }
    setCreatingPatient(true);
    try {
      const res = await axios.post(`${API_BASE}/patients`, newPatientForm);
      const createdPatient = res.data;
      showToast(`Registered ${createdPatient.name}.`);
      setNewPatientForm({
        name: '', birth_date: '', phone: '', id_number: '', gender: '1', married: '0', weight: '', height: '', common: ''
      });
      await selectPatientForConsultation(createdPatient, null);
    } catch (err) {
      showToast('Failed to register patient.', 'error');
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleSaveCommonDetails = async () => {
    if (!selectedPatient) return;
    setSavingCommon(true);
    try {
      await axios.put(`${API_BASE}/patients/${selectedPatient.id}/common`, { common: commonText });
      setSelectedPatient(prev => ({ ...prev, common: commonText }));
      setIsEditingCommon(false);
      showToast('Common details updated.');
    } catch (err) {
      showToast('Failed to update details.', 'error');
    } finally {
      setSavingCommon(false);
    }
  };

  const handleSaveAllergiesReports = async () => {
    if (!selectedPatient || !loggedInDoctor) return;
    setSavingAllergies(true);
    try {
      const res = await axios.put(`${API_BASE}/patients/${selectedPatient.id}/allergies-reports`, {
        findings_comment: allergiesText, active_ticket_id: activeTicketId, doctor_id: loggedInDoctor.id
      });
      if (res.data.ticket_id && !activeTicketId) setActiveTicketId(res.data.ticket_id);
      setIsEditingAllergies(false);
      showToast('Allergies and reports updated.');
    } catch (err) {
      showToast('Failed to update allergies.', 'error');
    } finally {
      setSavingAllergies(false);
    }
  };

  const handleSubmitPrescription = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPatient || !loggedInDoctor) {
      showToast('Please select a patient first.', 'error');
      return;
    }
    if (!prescriptionText.trim()) {
      showToast('Please enter a prescription.', 'error');
      return;
    }
    setSubmittingRx(true);
    try {
      await axios.post(`${API_BASE}/doctor/prescribe`, {
        patient_id: selectedPatient.id, ticket_id: activeTicketId, general: prescriptionText, reason_remarks: remarksText, doctor_id: loggedInDoctor.id, doctor_name: loggedInDoctor.name, patient_name: selectedPatient.name
      });
      showToast(`Prescription sent to Counter for ${selectedPatient.name}.`);
      setPrescriptionText('');
      setRemarksText('');
      sessionStorage.removeItem('draft_rx_general');
      await selectPatientForConsultation(selectedPatient, activeTicketId);
      await fetchQueue();
    } catch (err) {
      showToast('Failed to submit prescription.', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleRingCounterBell = async () => {
    if (!loggedInDoctor) return;
    setBellRinging(true);
    try {
      await axios.post(`${API_BASE}/doctor/bell`, {
        doctor_id: loggedInDoctor.id, doctor_name: loggedInDoctor.name
      });
      showToast('Counter bell rung!');
    } catch (err) {
      showToast('Failed to ring counter bell.', 'error');
    } finally {
      setTimeout(() => setBellRinging(false), 1000);
    }
  };

  return {
    activeTheme, setActiveTheme, loggedInDoctor, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loggingIn,
    handleDoctorLogin, handleDoctorLogout, sidebarTab, setSidebarTab, queueList, loadingQueue, fetchQueue, searchQuery, setSearchQuery,
    searchResults, searchPage, hasMoreSearch, searching, handleSearchPatients, newPatientForm, setNewPatientForm, creatingPatient,
    handleCreateWalkInPatient, selectedPatient, activeTicketId, loadingProfile, selectPatientForConsultation, commonText, setCommonText,
    isEditingCommon, setIsEditingCommon, savingCommon, handleSaveCommonDetails, allergiesText, setAllergiesText, isEditingAllergies,
    setIsEditingAllergies, savingAllergies, handleSaveAllergiesReports, prescriptionText, setPrescriptionText, remarksText, setRemarksText,
    submittingRx, handleSubmitPrescription, prescriptionHistory, bellRinging, handleRingCounterBell, statusBanner
  };
}