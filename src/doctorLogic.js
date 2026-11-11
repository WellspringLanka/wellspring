import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Calculate patient age from birth_date
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

// Format date cleanly (e.g., 11 Nov 2026)
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
  // 1. Doctor Authentication State (Isolated per browser tab via sessionStorage)
  const [loggedInDoctor, setLoggedInDoctor] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_doctor_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Left Sidebar Tabs: 'queue' | 'search' | 'add'
  const [sidebarTab, setSidebarTab] = useState('queue');

  // Queue State
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Direct Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  // Quick Add Walk-In Patient State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    birth_date: '',
    phone: '',
    id_number: '',
    gender: '1',
    common: ''
  });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Selected Patient & Active Ticket in Middle Section
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Editable Fields State
  const [commonText, setCommonText] = useState('');
  const [isEditingCommon, setIsEditingCommon] = useState(false);
  const [savingCommon, setSavingCommon] = useState(false);

  const [allergiesText, setAllergiesText] = useState('');
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  const [savingAllergies, setSavingAllergies] = useState(false);

  // Right Panel: "To Counter" Prescription State
  const [prescriptionText, setPrescriptionText] = useState(() => {
    return sessionStorage.getItem('draft_rx_general') || '';
  });
  const [remarksText, setRemarksText] = useState('');
  const [submittingRx, setSubmittingRx] = useState(false);

  // Bottom Panel: Historical Prescriptions Log
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);

  // Bell & Status Toast Notification
  const [bellRinging, setBellRinging] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 3500);
  };

  useEffect(() => {
    sessionStorage.setItem('draft_rx_general', prescriptionText);
  }, [prescriptionText]);

  // Handle Doctor Login
  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await axios.post(`${API_BASE}/doctor/login`, {
        username: loginUsername,
        password: loginPassword
      });
      const docData = res.data;
      setLoggedInDoctor(docData);
      sessionStorage.setItem('wellspring_doctor_session', JSON.stringify(docData));
      setLoginPassword('');
    } catch (err) {
      setLoginError(
        err.response?.data?.error || 'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Doctor Logout
  const handleDoctorLogout = () => {
    sessionStorage.removeItem('wellspring_doctor_session');
    setLoggedInDoctor(null);
    setSelectedPatient(null);
    setActiveTicketId(null);
  };

  // Fetch Active Queue
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

  // Select a Patient & Fetch Full Consultation Data
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

  // Server-Side Patient Search
  const handleSearchPatients = async (pageToLoad = 1, customQuery = searchQuery) => {
    const q = customQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`${API_BASE}/patients/search`, {
        params: { q, page: pageToLoad }
      });
      if (pageToLoad === 1) {
        setSearchResults(res.data.data || []);
      } else {
        setSearchResults(prev => [...prev, ...(res.data.data || [])]);
      }
      setSearchPage(pageToLoad);
      setHasMoreSearch(res.data.hasMore);
    } catch (err) {
      showToast('Search failed. Ensure backend server is running.', 'error');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (sidebarTab !== 'search') return;
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearchPatients(1, searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sidebarTab]);

  // Add New Walk-In Patient Directly
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
      showToast(`Registered ${createdPatient.name} for consultation.`);
      setNewPatientForm({
        name: '',
        birth_date: '',
        phone: '',
        id_number: '',
        gender: '1',
        common: ''
      });
      await selectPatientForConsultation(createdPatient, null);
    } catch (err) {
      showToast('Failed to register walk-in patient.', 'error');
    } finally {
      setCreatingPatient(false);
    }
  };

  // Save Edited "Common Details"
  const handleSaveCommonDetails = async () => {
    if (!selectedPatient) return;
    setSavingCommon(true);
    try {
      await axios.put(`${API_BASE}/patients/${selectedPatient.id}/common`, {
        common: commonText
      });
      setSelectedPatient(prev => ({ ...prev, common: commonText }));
      setIsEditingCommon(false);
      showToast('Common details updated.');
    } catch (err) {
      showToast('Failed to update common details.', 'error');
    } finally {
      setSavingCommon(false);
    }
  };

  // Save Edited "Allergies & Reports"
  const handleSaveAllergiesReports = async () => {
    if (!selectedPatient || !loggedInDoctor) return;
    setSavingAllergies(true);
    try {
      const res = await axios.put(`${API_BASE}/patients/${selectedPatient.id}/allergies-reports`, {
        findings_comment: allergiesText,
        active_ticket_id: activeTicketId,
        doctor_id: loggedInDoctor.id
      });
      if (res.data.ticket_id && !activeTicketId) {
        setActiveTicketId(res.data.ticket_id);
      }
      setIsEditingAllergies(false);
      showToast('Allergies and reports updated.');
    } catch (err) {
      showToast('Failed to update allergies and reports.', 'error');
    } finally {
      setSavingAllergies(false);
    }
  };

  // Submit Prescription ("To Counter" -> channeling_master.general)
  const handleSubmitPrescription = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPatient || !loggedInDoctor) {
      showToast('Please select a patient first.', 'error');
      return;
    }
    if (!prescriptionText.trim()) {
      showToast('Please enter a prescription before submitting.', 'error');
      return;
    }

    setSubmittingRx(true);
    try {
      await axios.post(`${API_BASE}/doctor/prescribe`, {
        patient_id: selectedPatient.id,
        ticket_id: activeTicketId,
        general: prescriptionText,
        reason_remarks: remarksText,
        doctor_id: loggedInDoctor.id,
        doctor_name: loggedInDoctor.name,
        patient_name: selectedPatient.name
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

  // Ring Counter Bell
  const handleRingCounterBell = async () => {
    if (!loggedInDoctor) return;
    setBellRinging(true);
    try {
      await axios.post(`${API_BASE}/doctor/bell`, {
        doctor_id: loggedInDoctor.id,
        doctor_name: loggedInDoctor.name
      });
      showToast('Counter bell rung.');
    } catch (err) {
      showToast('Failed to ring counter bell.', 'error');
    } finally {
      setTimeout(() => setBellRinging(false), 1000);
    }
  };

  return {
    loggedInDoctor,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    loggingIn,
    handleDoctorLogin,
    handleDoctorLogout,
    sidebarTab,
    setSidebarTab,
    queueList,
    loadingQueue,
    fetchQueue,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchPage,
    hasMoreSearch,
    searching,
    handleSearchPatients,
    newPatientForm,
    setNewPatientForm,
    creatingPatient,
    handleCreateWalkInPatient,
    selectedPatient,
    activeTicketId,
    loadingProfile,
    selectPatientForConsultation,
    commonText,
    setCommonText,
    isEditingCommon,
    setIsEditingCommon,
    savingCommon,
    handleSaveCommonDetails,
    allergiesText,
    setAllergiesText,
    isEditingAllergies,
    setIsEditingAllergies,
    savingAllergies,
    handleSaveAllergiesReports,
    prescriptionText,
    setPrescriptionText,
    remarksText,
    setRemarksText,
    submittingRx,
    handleSubmitPrescription,
    prescriptionHistory,
    bellRinging,
    handleRingCounterBell,
    statusBanner
  };
}