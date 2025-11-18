import React, { useState } from 'react';
import { useStore } from '../stores/appStore';
import { format, differenceInDays } from 'date-fns';

export const GanttChart: React.FC = () => {
  const { events } = useStore();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Filter and sort events for Gantt chart
  const ganttEvents = events
    .filter(event => event.endTime > event.startTime) // Only events with duration
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Calculate date range
  const startDate = ganttEvents.length > 0 
    ? new Date(Math.min(...ganttEvents.map(e => e.startTime.getTime())))
    : new Date();
    
  const endDate = ganttEvents.length > 0 
    ? new Date(Math.max(...ganttEvents.map(e => e.endTime.getTime())))
    : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week
  
  // Adjust dates based on view mode
  if (viewMode === 'week') {
    // Show current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    startDate.setTime(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    endDate.setTime(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  }
  
  const totalDays = differenceInDays(endDate, startDate) + 1;
  
  // Calculate bar position and width
  const calculateBarPosition = (event: any) => {
    const startOffset = differenceInDays(event.startTime, startDate);
    const duration = differenceInDays(event.endTime, event.startTime) + 1;
    
    const left = Math.max(0, (startOffset / totalDays) * 100);
    const width = Math.min(100 - left, (duration / totalDays) * 100);
    
    return { left: `${left}%`, width: `${width}%` };
  };
  
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
        <h2 style={{ margin: 0, color: '#1f2937' }}>Gantt Chart</h2>
        <div>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              backgroundColor: 'white'
            }}
          >
            <option value="week">This Week</option>
            <option value="month">All Events</option>
          </select>
        </div>
      </div>
      
      {ganttEvents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          No events with duration found. Create events with start and end times to see them in the Gantt chart.
        </div>
      ) : (
        <div>
          {/* Timeline header */}
          <div style={{ 
            display: 'flex', 
            marginBottom: 10,
            paddingLeft: 200 // Space for task names
          }}>
            {Array.from({ length: totalDays }).map((_, index) => {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + index);
              return (
                <div 
                  key={index}
                  style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    fontSize: 12, 
                    color: '#6b7280',
                    borderLeft: '1px solid #e5e7eb',
                    padding: '2px 0'
                  }}
                >
                  {format(date, 'EEE')}
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                    {format(date, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Gantt bars */}
          <div style={{ 
            maxHeight: 400, 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: 6
          }}>
            {ganttEvents.map((event, index) => {
              const barStyle = calculateBarPosition(event);
              
              return (
                <div 
                  key={event.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    minHeight: 40,
                    borderBottom: index < ganttEvents.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  {/* Task name */}
                  <div style={{ 
                    width: 200, 
                    padding: '0 15px',
                    fontWeight: '500',
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {event.title}
                  </div>
                  
                  {/* Timeline bar container */}
                  <div style={{ 
                    flex: 1, 
                    height: 30, 
                    position: 'relative',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: barStyle.left,
                        width: barStyle.width,
                        height: 20,
                        backgroundColor: event.color || '#3b82f6',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ 
                        padding: '0 5px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {differenceInDays(event.endTime, event.startTime) + 1}d
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: 20, 
        padding: 15, 
        backgroundColor: '#f0f9ff', 
        borderRadius: 6,
        fontSize: 14,
        color: '#0369a1'
      }}>
        <strong>Tip:</strong> Create events with both start and end times to appear in this Gantt chart. 
        Drag the edges of bars to adjust event durations.
      </div>
    </div>
  );
};