import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from '../types';

interface TimelineEvent extends CalendarEvent {
  zIndex: number;
  rotationX: number;
  rotationY: number;
  scale: number;
}

const Timeline3D: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: 'e1',
      title: 'Team Meeting',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      description: 'Weekly team sync',
      sourceCalendar: 'native',
      timestamp: Date.now() + 24 * 60 * 60 * 1000,
      zIndex: 1,
      rotationX: 0,
      rotationY: 0,
      scale: 1
    },
    {
      id: 'e2',
      title: 'Project Deadline',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      description: 'Submit final project deliverables',
      sourceCalendar: 'native',
      timestamp: Date.now() + 2 * 24 * 60 * 60 * 1000,
      zIndex: 2,
      rotationX: 5,
      rotationY: -5,
      scale: 1.1
    },
    {
      id: 'e3',
      title: 'Client Presentation',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      description: 'Present Q3 results to client',
      sourceCalendar: 'native',
      timestamp: Date.now() + 3 * 24 * 60 * 60 * 1000,
      zIndex: 3,
      rotationX: -5,
      rotationY: 5,
      scale: 0.9
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'scatter'>('timeline');
  const [rotation, setRotation] = useState({ x: -20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleRotateEvent = (eventId: string, axis: 'x' | 'y', delta: number) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            [`rotation${axis.toUpperCase()}`]: (event as any)[`rotation${axis.toUpperCase()}`] + delta 
          } 
        : event
    ));
  };

  const handleScaleEvent = (eventId: string, delta: number) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, scale: Math.max(0.5, Math.min(2, event.scale + delta)) } 
        : event
    ));
  };

  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="timeline-3d">
      <div className="timeline-header">
        <h2>3D Timeline View</h2>
        <div className="view-controls">
          <button 
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={viewMode === 'scatter' ? 'active' : ''}
            onClick={() => setViewMode('scatter')}
          >
            Scatter
          </button>
        </div>
      </div>
      
      <div 
        className="timeline-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="timeline-content"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {events.map(event => (
            <div
              key={event.id}
              className={`timeline-event ${selectedEvent?.id === event.id ? 'selected' : ''}`}
              style={{
                transform: `translateZ(${event.zIndex * 20}px) rotateX(${event.rotationX}deg) rotateY(${event.rotationY}deg) scale(${event.scale})`,
                transformStyle: 'preserve-3d'
              }}
              onClick={() => handleEventClick(event)}
            >
              <div className="event-card">
                <h3>{event.title}</h3>
                <p>{event.startTime.toLocaleDateString()}</p>
                <p className="time">
                  {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Timeline axis */}
          <div className="timeline-axis">
            <div className="axis-line"></div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="axis-marker">
                <div className="marker-date">
                  {new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedEvent && (
        <div className="event-details">
          <div className="details-header">
            <h3>Event Details</h3>
            <button onClick={handleCloseDetails}>×</button>
          </div>
          <div className="details-content">
            <p><strong>Title:</strong> {selectedEvent.title}</p>
            <p><strong>Date:</strong> {selectedEvent.startTime.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedEvent.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {selectedEvent.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            
            <div className="transform-controls">
              <div className="control-group">
                <label>Rotate X:</label>
                <button onClick={() => handleRotateEvent(selectedEvent.id, 'x', -5)}>−</button>
                <button onClick={() => handleRotateEvent(selectedEvent.id, 'x', 5)}>+</button>
              </div>
              <div className="control-group">
                <label>Rotate Y:</label>
                <button onClick={() => handleRotateEvent(selectedEvent.id, 'y', -5)}>−</button>
                <button onClick={() => handleRotateEvent(selectedEvent.id, 'y', 5)}>+</button>
              </div>
              <div className="control-group">
                <label>Scale:</label>
                <button onClick={() => handleScaleEvent(selectedEvent.id, -0.1)}>−</button>
                <button onClick={() => handleScaleEvent(selectedEvent.id, 0.1)}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="timeline-instructions">
        <p>Drag to rotate • Scroll to zoom • Click events for details</p>
      </div>
    </div>
  );
};

export default Timeline3D;