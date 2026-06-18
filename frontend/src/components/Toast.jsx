import { useState, useCallback, useRef, useEffect } from 'react';
import './Toast.css';

let toastIdCounter = 0;

function Toast({ toast: t, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(t.id), 200);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [t.id, onRemove]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(t.id), 200);
  };

  return (
    <div className={`toast toast-${t.type} ${exiting ? 'toast-exiting' : ''}`} role="alert">
      <span className="toast-dot" />
      <div className="toast-content">
        {t.title && <div className="toast-title">{t.title}</div>}
        {t.message && <div className="toast-message">{t.message}</div>}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="toast-timer">
        <div className="toast-timer-bar" />
      </div>
    </div>
  );
}

function ToastContainerComponent({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const toast = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    info: (title, message) => addToast('info', title, message),
    warning: (title, message) => addToast('warning', title, message),
  };

  const ToastContainer = useCallback(
    () => <ToastContainerComponent toasts={toasts} removeToast={removeToast} />,
    [toasts, removeToast]
  );

  return { toast, ToastContainer };
}
