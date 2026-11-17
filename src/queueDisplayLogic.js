import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useQueueDisplayLogic() {
  const [activeWaitingQueue, setActiveWaitingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveWaitingQueue = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/doctor/queue`);
      // Sort by the ticket_number (which corresponds to the daily # assigned)
      const sortedQueue = (res.data || []).sort((a, b) => a.ticket_number - b.ticket_number);
      setActiveWaitingQueue(sortedQueue);
      setError(null);
    } catch (err) {
      console.error('Failed to load active waiting queue:', err.message);
      setError('Connection to server lost. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchActiveWaitingQueue();

    // Poll every 3 seconds for near-instant updates on the TV screen
    const interval = setInterval(fetchActiveWaitingQueue, 3000);
    return () => clearInterval(interval);
  }, [fetchActiveWaitingQueue]);

  return { activeWaitingQueue, loading, error };
}