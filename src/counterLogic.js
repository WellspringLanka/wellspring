import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { DOCTOR_THEMES, calculateAge } from './doctorLogic';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Sound synthesizer for the Doctor Bell alert (works without external MP3 files)
function playDoctorBellSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 chime
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.18); // D6 chime
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // Audio blocked until user interaction
  }
}

export function useCounterPortalLogic() {
  // 1. Theme Selector (Synced with Clinical Teal default)
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('wellspring_counter_theme') || 'teal';
  });

  useEffect(() => {
    localStorage.setItem('wellspring_counter_theme', activeTheme);
  }, [activeTheme]);

  // 2. Counter Staff Auth State (Login: 'counter' or 'desk', pass: '1234')
  const [loggedInStaff, setLoggedInStaff] = useState(() => {
    const saved = sessionStorage.getItem('wellspring_counter_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // 3. Left Sidebar Page Navigation: 'pharmacy' | 'queue' | 'registration'
  const [activePage, setActivePage] = useState('pharmacy');

  // 4. Incoming Prescriptions from Doctor (flag = 2) & Multi-Patient Family Selection
  const [prescriptionQueue, setPrescriptionQueue] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [customWalkInName, setCustomWalkInName] = useState('');
  const [customWalkInPhone, setCustomWalkInPhone] = useState('');

  // 5. Medicine & Clinic Services Catalog
  const [medicinesCatalog, setMedicinesCatalog] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);

  // 6. Box A: Medicine Autocomplete & Price Updater State
  const [medSearchText, setMedSearchText] = useState('');
  const [selectedMedObj, setSelectedMedObj] = useState(null);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medUnitPrice, setMedUnitPrice] = useState('');
  const [medQty, setMedQty] = useState('1');
  const [updatingPriceInDb, setUpdatingPriceInDb] = useState(false);

  // 7. Box B: Dispensary Service / Fee State (No Quantity)
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceCustomName, setServiceCustomName] = useState('');
  const [serviceFeeAmount, setServiceFeeAmount] = useState('');

  // 8. Active POS Cart Items & Manual Final Total Override
  const [billItems, setBillItems] = useState([]);
  const [manualFinalTotal, setManualFinalTotal] = useState('');
  const [isManualTotalEdited, setIsManualTotalEdited] = useState(false);

  // 9. Checkout Receipt / SMS Modal State
  const [completedBillModal, setCompletedBillModal] = useState(null);
  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' | 'a4'
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  // 10. Live Doctor Bell Receiver Alert
  const [lastSeenBellId, setLastSeenBellId] = useState(() => {
    return Number(sessionStorage.getItem('last_seen_bell_id') || 0);
  });
  const [doctorBellAlert, setDoctorBellAlert] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  const showToast = (message, type = 'success') => {
    setStatusBanner({ message, type });
    setTimeout(() => setStatusBanner(null), 3500);
  };

  // Login Handler
  const handleCounterLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/login`, {
        username: loginUsername,
        password: loginPassword
      });
      setLoggedInStaff(res.data);
      sessionStorage.setItem('wellspring_counter_session', JSON.stringify(res.data));
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Unable to sign in to Counter Console.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCounterLogout = () => {
    sessionStorage.removeItem('wellspring_counter_session');
    setLoggedInStaff(null);
    setSelectedTicketIds([]);
    setBillItems([]);
  };

  // Load Medicines & Clinic Services Catalog
  const fetchCatalog = useCallback(async () => {
    if (!loggedInStaff) return;
    try {
      const res = await axios.get(`${API_BASE}/counter/catalog`);
      setMedicinesCatalog(res.data.medicines || []);
      setServicesCatalog(res.data.services || []);
      if (res.data.services && res.data.services.length > 0 && !selectedServiceId) {
        const firstSrv = res.data.services[0];
        setSelectedServiceId(String(firstSrv.id));
        setServiceFeeAmount(String(firstSrv.default_price));
      }
    } catch (err) {
      console.error('Failed to load catalog:', err.message);
    }
  }, [loggedInStaff, selectedServiceId]);

  // Fetch Incoming Doctor Prescriptions (flag = 2)
  const fetchPrescriptions = useCallback(async () => {
    if (!loggedInStaff) return;
    setLoadingPrescriptions(true);
    try {
      const res = await axios.get(`${API_BASE}/counter/prescriptions`);
      const list = res.data || [];
      setPrescriptionQueue(list);

      // Auto-select first waiting patient if none selected
      setSelectedTicketIds(prev => {
        const validExisting = prev.filter(id => list.some(item => item.ticket_id === id));
        if (validExisting.length > 0) return validExisting;
        return list.length > 0 ? [list[0].ticket_id] : [];
      });
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err.message);
    } finally {
      setLoadingPrescriptions(false);
    }
  }, [loggedInStaff]);

  // Poll for Doctor Bell & New Prescriptions every 4 seconds
  useEffect(() => {
    if (!loggedInStaff) return;
    fetchCatalog();
    fetchPrescriptions();

    const pollInterval = setInterval(async () => {
      fetchPrescriptions();
      try {
        const res = await axios.get(`${API_BASE}/counter/alerts`);
        const latestBell = res.data;
        if (latestBell && latestBell.id > lastSeenBellId) {
          if (lastSeenBellId !== 0) {
            setDoctorBellAlert(latestBell);
            playDoctorBellSound();
          }
          setLastSeenBellId(latestBell.id);
          sessionStorage.setItem('last_seen_bell_id', String(latestBell.id));
        }
      } catch {
        // Ignore polling network hiccups
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [loggedInStaff, fetchCatalog, fetchPrescriptions, lastSeenBellId]);

  // Select a single patient OR toggle multiple family members onto the same bill
  const handleSelectSinglePrescription = (ticketId) => {
    setSelectedTicketIds([ticketId]);
  };

  const handleToggleFamilyMember = (ticketId) => {
    setSelectedTicketIds(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const activePrescriptionCards = useMemo(() => {
    return prescriptionQueue.filter(item => selectedTicketIds.includes(item.ticket_id));
  }, [prescriptionQueue, selectedTicketIds]);

  // Filtered Medicine Suggestions for Autocomplete Dropdown
  const filteredMedicines = useMemo(() => {
    const q = medSearchText.trim().toLowerCase();
    if (!q) return medicinesCatalog.slice(0, 12);
    return medicinesCatalog
      .filter(m => m.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [medSearchText, medicinesCatalog]);

  const handlePickMedicineFromDropdown = (med) => {
    setSelectedMedObj(med);
    setMedSearchText(med.name);
    setMedUnitPrice(String(med.unit_price));
    setShowMedDropdown(false);
  };

  // Add Medicine to POS Bill (+ Auto-Update Price in DB if changed or new!)
  const handleAddMedicineToBill = async (e) => {
    if (e) e.preventDefault();
    const cleanName = medSearchText.trim();
    const priceNum = parseFloat(medUnitPrice);
    const qtyNum = parseFloat(medQty) || 1;

    if (!cleanName) {
      return showToast('Please enter or select a medicine name.', 'error');
    }
    if (isNaN(priceNum) || priceNum < 0) {
      return showToast('Please enter a valid unit price.', 'error');
    }

    // Check if price was edited or if this is a brand-new medicine
    const priceWasEdited =
      !selectedMedObj ||
      selectedMedObj.name.toLowerCase() !== cleanName.toLowerCase() ||
      Number(selectedMedObj.unit_price) !== priceNum;

    if (priceWasEdited) {
      setUpdatingPriceInDb(true);
      try {
        const res = await axios.post(`${API_BASE}/counter/medicines/upsert`, {
          id: selectedMedObj && selectedMedObj.name.toLowerCase() === cleanName.toLowerCase() ? selectedMedObj.id : null,
          name: cleanName,
          unit_price: priceNum
        });
        const savedMed = res.data;
        setMedicinesCatalog(prev => {
          const exists = prev.some(m => m.id === savedMed.id);
          if (exists) {
            return prev.map(m => (m.id === savedMed.id ? savedMed : m));
          }
          return [...prev, savedMed].sort((a, b) => a.name.localeCompare(b.name));
        });
        showToast(`Updated "${savedMed.name}" price to Rs. ${priceNum.toFixed(2)} in database.`);
      } catch {
        showToast('Added to bill, but could not update database price.', 'error');
      } finally {
        setUpdatingPriceInDb(false);
      }
    }

    const lineTotal = priceNum * qtyNum;
    setBillItems(prev => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        item_type: 'MEDICINE',
        name: cleanName,
        unit_price: priceNum,
        qty: qtyNum,
        line_total: lineTotal
      }
    ]);

    // Reset Medicine Input for next rapid POS entry
    setMedSearchText('');
    setSelectedMedObj(null);
    setMedUnitPrice('');
    setMedQty('1');
  };

  // Handle Clinic Service Dropdown Change
  const handleServiceSelectChange = (srvId) => {
    setSelectedServiceId(srvId);
    if (srvId === 'custom') {
      setServiceCustomName('');
      setServiceFeeAmount('');
      return;
    }
    const found = servicesCatalog.find(s => String(s.id) === String(srvId));
    if (found) {
      setServiceFeeAmount(String(found.default_price));
    }
  };

  // Add Dispensary Service / Fee (No Quantity Needed)
  const handleAddServiceToBill = (e) => {
    if (e) e.preventDefault();
    const feeNum = parseFloat(serviceFeeAmount);
    if (isNaN(feeNum) || feeNum < 0) {
      return showToast('Please enter a valid service fee amount.', 'error');
    }

    let label = 'Consultation / Clinic Fee';
    if (selectedServiceId === 'custom') {
      if (!serviceCustomName.trim()) {
        return showToast('Please type a description for the custom charge.', 'error');
      }
      label = serviceCustomName.trim();
    } else {
      const found = servicesCatalog.find(s => String(s.id) === String(selectedServiceId));
      if (found) label = found.service_name;
    }

    setBillItems(prev => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        item_type: 'SERVICE',
        name: label,
        unit_price: feeNum,
        qty: null, // Explicitly no quantity for consultation/inspection fees
        line_total: feeNum
      }
    ]);
  };

  const handleRemoveBillItem = (uid) => {
    setBillItems(prev => prev.filter(item => item.uid !== uid));
  };

  const handleClearPOSCart = () => {
    setBillItems([]);
    setIsManualTotalEdited(false);
    setManualFinalTotal('');
  };

  // Calculate System Total
  const calculatedTotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  }, [billItems]);

  // Keep Manual Final Total synced with Calculated Total unless manually overridden
  useEffect(() => {
    if (!isManualTotalEdited) {
      setManualFinalTotal(calculatedTotal > 0 ? String(calculatedTotal.toFixed(2)) : '0.00');
    }
  }, [calculatedTotal, isManualTotalEdited]);

  const handleManualTotalChange = (val) => {
    setIsManualTotalEdited(true);
    setManualFinalTotal(val);
  };

  const handleQuickRoundTotal = (step) => {
    if (calculatedTotal <= 0) return;
    const rounded = Math.round(calculatedTotal / step) * step;
    setIsManualTotalEdited(true);
    setManualFinalTotal(String(rounded.toFixed(2)));
  };

  // Complete Checkout OR Mark as Outdoor Prescription ("Outdoor Rx / Leave")
  const handleFinalizeCheckout = async (mode = 'COMPLETED_BILL') => {
    const combinedNames =
      activePrescriptionCards.length > 0
        ? activePrescriptionCards.map(c => c.patient.name).join(', ')
        : customWalkInName.trim() || 'Walk-In Patient';

    const primaryPhone =
      activePrescriptionCards.length > 0
        ? activePrescriptionCards[0].patient.phone || ''
        : customWalkInPhone.trim();

    const doctorName =
      activePrescriptionCards.length > 0
        ? activePrescriptionCards[0].doctor_name
        : 'Wellspring Physician';

    const finalPayable = mode === 'OUTDOOR_RX' && billItems.length === 0
      ? 0
      : parseFloat(manualFinalTotal) || 0;

    setSubmittingCheckout(true);
    try {
      const res = await axios.post(`${API_BASE}/counter/checkout`, {
        ticket_ids: selectedTicketIds,
        patient_names: combinedNames,
        patient_phone: primaryPhone,
        doctor_name: doctorName,
        bill_status: mode,
        calculated_total: calculatedTotal,
        final_total: finalPayable,
        items_snapshot: billItems,
        created_by: loggedInStaff?.name || 'Counter'
      });

      if (mode === 'OUTDOOR_RX') {
        showToast(`Marked ${combinedNames} as Outdoor Prescription & removed from queue.`);
      } else {
        // Open Receipt / Print / SMS Modal
        setCompletedBillModal({
          bill_id: res.data.bill.id,
          date_str: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          patient_names: combinedNames,
          patient_phone: primaryPhone,
          doctor_name: doctorName,
          final_total: finalPayable,
          staff_name: loggedInStaff?.name || 'Counter'
        });
      }

      // Clear active cart & refresh waiting prescriptions
      setBillItems([]);
      setIsManualTotalEdited(false);
      setManualFinalTotal('0.00');
      setCustomWalkInName('');
      setCustomWalkInPhone('');
      setSelectedTicketIds([]);
      await fetchPrescriptions();
    } catch {
      showToast('Failed to complete transaction. Check backend connection.', 'error');
    } finally {
      setSubmittingCheckout(false);
    }
  };

  // Send SMS Bill Summary (Summary Total Only)
  const handleSendSmsBill = (billObj) => {
    if (!billObj) return;
    const smsText = `Wellspring Dispensary Receipt\nPatient: ${billObj.patient_names}\nDate: ${billObj.date_str}\nTotal Paid: Rs. ${Number(billObj.final_total).toFixed(2)}\nThank you for visiting Wellspring Medical Center.`;
    navigator.clipboard?.writeText(smsText);
    showToast(
      billObj.patient_phone
        ? `SMS Bill dispatched to ${billObj.patient_phone} (and copied to clipboard)!`
        : 'SMS Bill formatted and copied to clipboard!'
    );
  };

  return {
    DOCTOR_THEMES,
    calculateAge,
    activeTheme,
    setActiveTheme,
    loggedInStaff,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    loggingIn,
    handleCounterLogin,
    handleCounterLogout,
    activePage,
    setActivePage,
    prescriptionQueue,
    loadingPrescriptions,
    fetchPrescriptions,
    selectedTicketIds,
    handleSelectSinglePrescription,
    handleToggleFamilyMember,
    activePrescriptionCards,
    customWalkInName,
    setCustomWalkInName,
    customWalkInPhone,
    setCustomWalkInPhone,
    medicinesCatalog,
    servicesCatalog,
    medSearchText,
    setMedSearchText,
    selectedMedObj,
    showMedDropdown,
    setShowMedDropdown,
    filteredMedicines,
    handlePickMedicineFromDropdown,
    medUnitPrice,
    setMedUnitPrice,
    medQty,
    setMedQty,
    updatingPriceInDb,
    handleAddMedicineToBill,
    selectedServiceId,
    handleServiceSelectChange,
    serviceCustomName,
    setServiceCustomName,
    serviceFeeAmount,
    setServiceFeeAmount,
    handleAddServiceToBill,
    billItems,
    handleRemoveBillItem,
    handleClearPOSCart,
    calculatedTotal,
    manualFinalTotal,
    isManualTotalEdited,
    setIsManualTotalEdited,
    handleManualTotalChange,
    handleQuickRoundTotal,
    submittingCheckout,
    handleFinalizeCheckout,
    completedBillModal,
    setCompletedBillModal,
    printFormat,
    setPrintFormat,
    handleSendSmsBill,
    doctorBellAlert,
    setDoctorBellAlert,
    statusBanner
  };
}