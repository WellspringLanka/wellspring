import { useQueueDisplayLogic } from './queueDisplayLogic';
import './QueueDisplay.css';

export default function QueueDisplay() {
  const { activeWaitingQueue, loading, error } = useQueueDisplayLogic();

  return (
    <div className="queue-display-wrapper">
      {error && <div className="queue-error-banner">{error}</div>}
      
      <header className="queue-display-header">
        <h1 className="queue-display-title">Doctor Consultation</h1>
        <div className="queue-display-count">
          WAITING: {activeWaitingQueue.length}
        </div>
      </header>

      <main className="queue-list-container">
        {loading ? (
          <div className="queue-empty-state">Loading Queue...</div>
        ) : activeWaitingQueue.length === 0 ? (
          <div className="queue-empty-state">NO PATIENTS WAITING</div>
        ) : (
          activeWaitingQueue.map((item, index) => {
            // The first item in the sorted array is always Next Up
            const isNextUp = index === 0; 
            
            return (
              <div 
                key={item.ticket_id} 
                className={`queue-item-row ${isNextUp ? 'next-up' : ''}`}
              >
                <div className="queue-item-number">
                  #{item.ticket_number}
                </div>
                <div className="queue-item-name">
                  {item.patient.name}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}