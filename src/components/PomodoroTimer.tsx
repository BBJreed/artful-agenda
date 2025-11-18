import React, { useState, useEffect, useRef } from 'react';

interface PomodoroTimerProps {
  onTimerComplete?: () => void;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onTimerComplete,
  onTimerStart,
  onTimerPause
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      handleTimerComplete();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  // Handle timer completion
  const handleTimerComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
    
    // Notify parent
    if (onTimerComplete) {
      onTimerComplete();
    }
    
    // Switch mode
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakDuration * 60);
      setSessionsCompleted(prev => prev + 1);
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
    
    // Auto-start next session
    setIsActive(true);
    if (onTimerStart) {
      onTimerStart();
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    setIsActive(true);
    if (onTimerStart) {
      onTimerStart();
    }
  };

  // Pause timer
  const pauseTimer = () => {
    setIsActive(false);
    if (onTimerPause) {
      onTimerPause();
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  // Skip to next session
  const skipSession = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  // Update work duration
  const updateWorkDuration = (minutes: number) => {
    setWorkDuration(minutes);
    if (mode === 'work' && !isActive) {
      setTimeLeft(minutes * 60);
    }
  };

  // Update break duration
  const updateBreakDuration = (minutes: number) => {
    setBreakDuration(minutes);
    if (mode === 'break' && !isActive) {
      setTimeLeft(minutes * 60);
    }
  };

  // Calculate progress percentage
  const progress = mode === 'work' 
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <h2>Pomodoro Timer</h2>
        <div className="session-counter">
          Sessions: {sessionsCompleted}
        </div>
      </div>
      
      <div className="timer-display">
        <div className="mode-indicator">
          {mode === 'work' ? '_focus time_' : 'break time'}
        </div>
        <div className="time-display">
          {formatTime(timeLeft)}
        </div>
        <div className="progress-ring">
          <svg width="200" height="200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="10"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={mode === 'work' ? '#3b82f6' : '#10b981'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
        </div>
      </div>
      
      <div className="timer-controls">
        {!isActive ? (
          <button className="control-button start" onClick={startTimer}>
            Start
          </button>
        ) : (
          <button className="control-button pause" onClick={pauseTimer}>
            Pause
          </button>
        )}
        <button className="control-button reset" onClick={resetTimer}>
          Reset
        </button>
        <button className="control-button skip" onClick={skipSession}>
          Skip
        </button>
      </div>
      
      <div className="timer-settings">
        <div className="setting-group">
          <label>Work Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => updateWorkDuration(Number(e.target.value))}
            disabled={isActive}
          />
        </div>
        <div className="setting-group">
          <label>Break Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => updateBreakDuration(Number(e.target.value))}
            disabled={isActive}
          />
        </div>
      </div>
      
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFd2xqZ2VjYF1bWVhXVlVUU1JRUFFQUVJTVFVWV1hZWltdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==" />
      

    </div>
  );
};

export default PomodoroTimer;