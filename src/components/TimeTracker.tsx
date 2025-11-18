import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../stores/appStore';
import { TaskItem } from '../types';

export const TimeTracker: React.FC = () => {
  const { tasks, updateTask } = useStore();
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format time for display (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start tracking time for a task
  const startTracking = (task: TaskItem) => {
    if (activeTask && activeTask.id === task.id) {
      // If already tracking this task, pause it
      pauseTracking();
      return;
    }
    
    // Stop current tracking if any
    if (isRunning) {
      stopTracking();
    }
    
    setActiveTask(task);
    setIsRunning(true);
    setElapsedTime(0);
  };
  
  // Pause tracking
  const pauseTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };
  
  // Stop tracking and save time
  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (activeTask) {
      // In a real app, you would save the tracked time to the task
      console.log(`Tracked ${formatTime(elapsedTime)} for task: ${activeTask.content}`);
    }
    
    setIsRunning(false);
    setActiveTask(null);
    setElapsedTime(0);
  };
  
  // Update elapsed time
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  return (
    <div style={{
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0, marginBottom: 20, color: '#1f2937' }}>Time Tracker</h2>
      
      {activeTask && (
        <div style={{
          backgroundColor: '#eff6ff',
          padding: 15,
          borderRadius: 6,
          marginBottom: 20,
          border: '1px solid #dbeafe'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 10
          }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#1e40af' }}>
              Tracking: {activeTask.content}
            </h3>
            <button
              onClick={stopTracking}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Stop
            </button>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            fontSize: 24, 
            fontWeight: 'bold', 
            fontFamily: 'monospace',
            color: '#1e40af',
            marginBottom: 15
          }}>
            {formatTime(elapsedTime)}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={pauseTracking}
              disabled={!isRunning}
              style={{
                padding: '8px 16px',
                backgroundColor: isRunning ? '#f59e0b' : '#e5e7eb',
                color: isRunning ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: 6,
                cursor: isRunning ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                marginRight: 10
              }}
            >
              {isRunning ? 'Pause' : 'Paused'}
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: 15 }}>
        <h3 style={{ margin: 0, marginBottom: 10, fontSize: 16, color: '#374151' }}>
          Your Tasks
        </h3>
        
        {tasks.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontStyle: 'italic',
            padding: 20
          }}>
            No tasks available. Create some tasks to start tracking time.
          </p>
        ) : (
          <div style={{ 
            maxHeight: 300, 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: 6
          }}>
            {tasks.map(task => (
              <div 
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderBottom: tasks.indexOf(task) < tasks.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flex: 1
                }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => updateTask(task.id, { completed: !task.completed })}
                    style={{ marginRight: 10 }}
                  />
                  <span style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#9ca3af' : '#1f2937'
                  }}>
                    {task.content}
                  </span>
                </div>
                
                <button
                  onClick={() => startTracking(task)}
                  disabled={activeTask !== null && activeTask.id !== task.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: activeTask?.id === task.id 
                      ? (isRunning ? '#ef4444' : '#f59e0b') 
                      : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: activeTask !== null && activeTask.id !== task.id ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  {activeTask?.id === task.id 
                    ? (isRunning ? 'Stop' : 'Resume') 
                    : 'Start'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ 
        padding: 15, 
        backgroundColor: '#f0f9ff', 
        borderRadius: 6,
        fontSize: 14,
        color: '#0369a1'
      }}>
        <strong>How to use:</strong> Select a task to start tracking time. 
        The timer will count seconds spent on that task. 
        You can pause, resume, or stop tracking at any time.
      </div>
    </div>
  );
};