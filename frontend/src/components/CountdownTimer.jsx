import { useState, useEffect } from 'react';
import './CountdownTimer.css';

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline || Number(deadline) === 0) {
      setTimeLeft(null);
      return;
    }

    const deadlineMs = Number(deadline) * 1000;

    const tick = () => {
      const diff = deadlineMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          expired: false,
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || Number(deadline) === 0) {
    return (
      <div className="countdown" id="countdown-timer">
        <span className="countdown-open">No deadline set, voting is open</span>
      </div>
    );
  }

  if (timeLeft?.expired) {
    return (
      <div className="countdown" id="countdown-timer">
        <span className="countdown-closed">Voting has ended</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours === 0;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`countdown ${isUrgent ? 'countdown-urgent' : ''}`} id="countdown-timer">
      <span className="countdown-label">Ends in</span>
      <div className="countdown-blocks">
        {timeLeft.days > 0 && (
          <>
            <div className="countdown-block">
              <span className="countdown-value">{pad(timeLeft.days)}</span>
              <span className="countdown-unit">d</span>
            </div>
            <span className="countdown-sep">:</span>
          </>
        )}
        <div className="countdown-block">
          <span className="countdown-value">{pad(timeLeft.hours)}</span>
          <span className="countdown-unit">h</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-value">{pad(timeLeft.minutes)}</span>
          <span className="countdown-unit">m</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-value">{pad(timeLeft.seconds)}</span>
          <span className="countdown-unit">s</span>
        </div>
      </div>
    </div>
  );
}
