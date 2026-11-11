import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper: Calculate accurate Age from birth_date (YYYY-MM-DD)
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

// Helper: Format Dates clearly for 53-year-old Doctor readability (e.g., "14 Nov 2026")
export function formatClearDate(dateString) {
  if (!dateString) return 'No Date Recorded';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function useDoctorPortalLogic() {
  // Doctors & Active Selected Doctor
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Upul', specialty: 'Senior Medical Officer' }
  ]);
  const [activeDoctor, setActiveDoctor] = useState({
    id: 1,
    name: 'Dr. Upul',
    specialty: 'Senior Medical Officer'
  });

  // Left Sidebar Tabs: 'queue' | 'search' | 'add'
  const [sidebarTab, setSidebarTab] = useState('queue');

  // Queue State
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Direct Search State (Server-side paginated)
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

  // Editable Fields State: "Common Details" & "Allergies and Reports"
  const [commonText, setCommonText] = useState('');
  const [isEditingCommon, setIsEditingCommon] = useState(false);
  const [savingCommon, setSavingCommon] = useState(false);

  const [allergiesText, setAllergiesText] = useState('');
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  const [savingAllergies, setSavingAllergies] = useState(false);

  // Right Panel: "To Counter" Prescription State (Tab-isolated via sessionStorage)
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

  // Save draft prescription to tab-isolated sessionStorage
  useEffect(() => {
    sessionStorage.setItem('draft_rx_general', prescriptionText);
  }, [prescriptionText]);

  // 1. Fetch Doctors List on Mount
  useEffect(() => {
    axios.get(`${API_BASE}/doctors`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setDoctors(res.data);
          setActiveDoctor(res.data[0]);
        }
      })
      .catch(() => {
        // Fallback to Dr. Upul if backend is waking up
      });
  }, []);

  // 2. Fetch Active Queue
  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/queue`);
      setQueueList(res.data || []);
    } catch (err) {
      console.error('Failed to load queue:', err.message);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Refresh queue every 10s
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // 3. Select a Patient (From Queue OR Direct Search) & Fetch Full Consultation Data
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
      // Fallback if only basic patient object is available
      setSelectedPatient(patientObj);
      setCommonText(patientObj.common || '');
      setAllergiesText('');
      setPrescriptionHistory([]);
      showToast('Loaded offline patient view. Check backend connection.', 'warning');
    } finally {
      setLoadingProfile(false);
    }
  };

  // 4. Server-Side Patient Search (By Name, Phone, NIC, Reference, Common)
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

  // Trigger search automatically as doctor types (debounced 300ms)
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

  // 5. Add New Walk-In Patient Directly from Doctor Sidebar
  const handleCreateWalkInPatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) {
      showToast('Please enter the patient name.', 'error');
      return;
    }
    setCreatingPatient(true);
    try {
      const res = await axios.post(`${API_BASE}/patients`, newPatientForm);
      const createdPatient = res.data;
      showToast(`Added ${createdPatient.name} & loaded for consultation!`);
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
      showToast('Failed to add patient to database.', 'error');
    } finally {
      setCreatingPatient(false);
    }
  };

  // 6. Save Edited "Common Details" to patients_master.common
  const handleSaveCommonDetails = async () => {
    if (!selectedPatient) return;
    setSavingCommon(true);
    try {
      await axios.put(`${API_BASE}/patients/${selectedPatient.id}/common`, {
        common: commonText
      });
      setSelectedPatient(prev => ({ ...prev, common: commonText }));
      setIsEditingCommon(false);
      showToast('Common details saved to database.');
    } catch (err) {
      showToast('Error saving common details.', 'error');
    } finally {
      setSavingCommon(false);
    }
  };

  // 7. Save Edited "Allergies & Reports" to channeling_findings_master.findings_comment
  const handleSaveAllergiesReports = async () => {
    if (!selectedPatient) return;
    setSavingAllergies(true);
    try {
      const res = await axios.put(`${API_BASE}/patients/${selectedPatient.id}/allergies-reports`, {
        findings_comment: allergiesText,
        active_ticket_id: activeTicketId,
        doctor_id: activeDoctor.id
      });
      if (res.data.ticket_id && !activeTicketId) {
        setActiveTicketId(res.data.ticket_id);
      }
      setIsEditingAllergies(false);
      showToast('Allergies & Reports saved to database.');
    } catch (err) {
      showToast('Error saving Allergies & Reports.', 'error');
    } finally {
      setSavingAllergies(false);
    }
  };

  // 8. Submit Prescription ("To Counter" -> channeling_master.general)
  const handleSubmitPrescription = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPatient) {
      showToast('Please select a patient first.', 'error');
      return;
    }
    if (!prescriptionText.trim()) {
      showToast('Please enter the prescription before submitting to Counter.', 'error');
      return;
    }

    setSubmittingRx(true);
    try {
      await axios.post(`${API_BASE}/doctor/prescribe`, {
        patient_id: selectedPatient.id,
        ticket_id: activeTicketId,
        general: prescriptionText,
        reason_remarks: remarksText,
        doctor_id: activeDoctor.id,
        doctor_name: activeDoctor.name,
        patient_name: selectedPatient.name
      });

      showToast(`Prescription for ${selectedPatient.name} sent to Counter!`);
      setPrescriptionText('');
      setRemarksText('');
      sessionStorage.removeItem('draft_rx_general');

      // Refresh patient history log & active queue
      await selectPatientForConsultation(selectedPatient, activeTicketId);
      await fetchQueue();
    } catch (err) {
      showToast('Failed to send prescription to Counter.', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  // 9. Ring Counter Bell (Top-Right Bell Button)
  const handleRingCounterBell = async () => {
    setBellRinging(true);
    try {
      await axios.post(`${API_BASE}/doctor/bell`, {
        doctor_id: activeDoctor.id,
        doctor_name: activeDoctor.name
      });
      showToast('🔔 Counter Bell Rang! Counter has been alerted.');
    } catch (err) {
      showToast('🔔 Bell triggered (Offline mode).', 'warning');
    } finally {
      setTimeout(() => setBellRinging(false), 1200);
    }
  };

  return {
    doctors,
    activeDoctor,
    setActiveDoctor,
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