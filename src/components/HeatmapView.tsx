import React, { useState } from 'react';
import { useStore } from '../stores/appStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

export const HeatmapView: React.FC = () => {
  const { events, tasks } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate heatmap data
  const generateHeatmapData = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Count activities per day
    const activityCounts: Record<string, number> = {};
    
    days.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      activityCounts[dateStr] = 0;
    });
    
    // Count events
    events.forEach(event => {
      const dateStr = event.startTime.toISOString().split('T')[0];
      if (activityCounts[dateStr] !== undefined) {
        activityCounts[dateStr] += 1;
      }
    });
    
    // Count tasks
    tasks.forEach(task => {
      const dateStr = task.date;
      if (activityCounts[dateStr] !== undefined) {
        activityCounts[dateStr] += 1;
      }
    });
    
    return { days, activityCounts };
  };
  
  const { days, activityCounts } = generateHeatmapData();
  
  // Get max activity count for color scaling
  const maxActivity = Math.max(...Object.values(activityCounts), 1);
  
  // Get color based on activity level
  const getActivityColor = (count: number) => {
    if (count === 0) return '#e5e7eb'; // Gray for no activity
    
    const intensity = count / maxActivity;
    if (intensity < 0.25) return '#dcfce7'; // Light green
    if (intensity < 0.5) return '#bbf7d0';  // Green
    if (intensity < 0.75) return '#4ade80'; // Medium green
    return '#22c55e'; // Dark green
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };
  
  // Group days by weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    
    // If it's Sunday or the last day of the month
    if (day.getDay() === 6 || index === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });
  
  // Pad the first week with empty cells if it doesn't start on Sunday
  if (weeks.length > 0 && weeks[0].length < 7) {
    const firstWeek = weeks[0];
    const paddingCount = 7 - firstWeek.length;
    for (let i = 0; i < paddingCount; i++) {
      firstWeek.unshift(new Date(firstWeek[0].getTime() - (i + 1) * 24 * 60 * 60 * 1000));
    }
  }
  
  return (
    <div style={{
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>Activity Heatmap</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => navigateMonth('prev')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button 
            onClick={() => navigateMonth('next')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            →
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 2,
          marginBottom: 5
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              style={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: 12, 
                color: '#6b7280',
                padding: '4px 0'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}>
          {weeks.map((week, weekIndex) => (
            <div 
              key={weekIndex} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 2 
              }}
            >
              {week.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const count = activityCounts[dateStr] || 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={dayIndex}
                    style={{
                      aspectRatio: '1/1',
                      backgroundColor: isCurrentMonth ? getActivityColor(count) : '#f3f4f6',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: isCurrentMonth ? '#1f2937' : '#9ca3af',
                      fontWeight: 'bold',
                      border: '1px solid #e5e7eb'
                    }}
                    title={`${format(day, 'MMM d, yyyy')}: ${count} activities`}
                  >
                    {isCurrentMonth ? format(day, 'd') : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10,
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 6
      }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Activity Level:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{
                width: 20,
                height: 20,
                backgroundColor: level === 0 ? '#e5e7eb' : 
                               level === 1 ? '#dcfce7' : 
                               level === 2 ? '#bbf7d0' : 
                               level === 3 ? '#4ade80' : '#22c55e',
                borderRadius: 2,
                margin: '0 2px'
              }}
            ></div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          Low to High
        </div>
      </div>
    </div>
  );
};