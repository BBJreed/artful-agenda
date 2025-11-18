import React, { useState, useEffect } from 'react';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'list' | 'stat' | 'calendar';
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
}

const InteractiveDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'w1',
      title: 'Productivity Overview',
      type: 'chart',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [65, 78, 70, 85, 90, 45, 50]
      },
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      config: { chartType: 'bar', color: '#007bff' }
    },
    {
      id: 'w2',
      title: 'Upcoming Events',
      type: 'list',
      data: [
        { id: 'e1', title: 'Team Meeting', time: '10:00 AM' },
        { id: 'e2', title: 'Client Call', time: '2:00 PM' },
        { id: 'e3', title: 'Project Review', time: '4:00 PM' }
      ],
      position: { x: 420, y: 0 },
      size: { width: 300, height: 300 },
      config: {}
    },
    {
      id: 'w3',
      title: 'Tasks Completed',
      type: 'stat',
      data: { value: 24, total: 30, percentage: 80 },
      position: { x: 0, y: 320 },
      size: { width: 200, height: 150 },
      config: { color: '#28a745' }
    },
    {
      id: 'w4',
      title: 'This Week',
      type: 'calendar',
      data: {},
      position: { x: 220, y: 320 },
      size: { width: 500, height: 300 },
      config: {}
    }
  ]);

  const [draggingWidget, setDraggingWidget] = useState<{ 
    widgetId: string; 
    offsetX: number; 
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const [resizingWidget, setResizingWidget] = useState<{ 
    widgetId: string; 
    direction: 'se' | 'sw' | 'ne' | 'nw';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const handleWidgetMouseDown = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWidget(widgetId);
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    setDraggingWidget({
      widgetId,
      offsetX: e.clientX - widget.position.x,
      offsetY: e.clientY - widget.position.y,
      startX: e.clientX,
      startY: e.clientY
    });
  };

  const handleResizeMouseDown = (widgetId: string, direction: 'se' | 'sw' | 'ne' | 'nw', e: React.MouseEvent) => {
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    setResizingWidget({
      widgetId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: widget.size.width,
      startHeight: widget.size.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingWidget) {
      const newX = e.clientX - draggingWidget.offsetX;
      const newY = e.clientY - draggingWidget.offsetY;
      
      setWidgets(prev => prev.map(widget => 
        widget.id === draggingWidget.widgetId 
          ? { ...widget, position: { x: newX, y: newY } } 
          : widget
      ));
    }
    
    if (resizingWidget) {
      const deltaX = e.clientX - resizingWidget.startX;
      const deltaY = e.clientY - resizingWidget.startY;
      
      setWidgets(prev => prev.map(widget => {
        if (widget.id !== resizingWidget.widgetId) return widget;
        
        let newWidth = resizingWidget.startWidth;
        let newHeight = resizingWidget.startHeight;
        let newX = widget.position.x;
        let newY = widget.position.y;
        
        switch (resizingWidget.direction) {
          case 'se':
            newWidth = Math.max(200, resizingWidget.startWidth + deltaX);
            newHeight = Math.max(150, resizingWidget.startHeight + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(200, resizingWidget.startWidth - deltaX);
            newHeight = Math.max(150, resizingWidget.startHeight + deltaY);
            newX = widget.position.x + (resizingWidget.startWidth - newWidth);
            break;
          case 'ne':
            newWidth = Math.max(200, resizingWidget.startWidth + deltaX);
            newHeight = Math.max(150, resizingWidget.startHeight - deltaY);
            newY = widget.position.y + (resizingWidget.startHeight - newHeight);
            break;
          case 'nw':
            newWidth = Math.max(200, resizingWidget.startWidth - deltaX);
            newHeight = Math.max(150, resizingWidget.startHeight - deltaY);
            newX = widget.position.x + (resizingWidget.startWidth - newWidth);
            newY = widget.position.y + (resizingWidget.startHeight - newHeight);
            break;
        }
        
        return {
          ...widget,
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight }
        };
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
    setResizingWidget(null);
  };

  const addWidget = () => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: 'New Widget',
      type: 'stat',
      data: { value: 0, total: 100, percentage: 0 },
      position: { x: 100, y: 100 },
      size: { width: 250, height: 200 },
      config: {}
    };
    
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  };

  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="chart-widget">
            <div className="chart-container">
              {widget.data.labels.map((label: string, index: number) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${widget.data.values[index]}%`,
                      backgroundColor: widget.config.color || '#007bff'
                    }}
                  ></div>
                  <div className="bar-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="list-widget">
            <ul>
              {widget.data.map((item: any) => (
                <li key={item.id}>
                  <span className="event-title">{item.title}</span>
                  <span className="event-time">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'stat':
        return (
          <div className="stat-widget">
            <div className="stat-value">{widget.data.value}</div>
            <div className="stat-label">of {widget.data.total} completed</div>
            <div className="stat-progress">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${widget.data.percentage}%`,
                  backgroundColor: widget.config.color || '#007bff'
                }}
              ></div>
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="calendar-widget">
            <div className="calendar-header">
              <button className="nav-btn">←</button>
              <span className="current-month">November 2025</span>
              <button className="nav-btn">→</button>
            </div>
            <div className="calendar-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="calendar-day-header">{day}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className={`calendar-day ${i === 16 ? 'today' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div>Widget content</div>;
    }
  };

  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingWidget(null);
      setResizingWidget(null);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="interactive-dashboard">
      <div className="dashboard-header">
        <h2>Interactive Dashboard</h2>
        <div className="dashboard-actions">
          <button onClick={addWidget}>Add Widget</button>
        </div>
      </div>
      
      <div 
        className="dashboard-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={`dashboard-widget ${selectedWidget === widget.id ? 'selected' : ''}`}
            style={{
              left: widget.position.x,
              top: widget.position.y,
              width: widget.size.width,
              height: widget.size.height
            }}
            onMouseDown={(e) => handleWidgetMouseDown(widget.id, e)}
          >
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <button 
                className="remove-widget"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="widget-content">
              {renderWidgetContent(widget)}
            </div>
            
            {/* Resize handles */}
            <div 
              className="resize-handle se"
              onMouseDown={(e) => handleResizeMouseDown(widget.id, 'se', e)}
            ></div>
            <div 
              className="resize-handle sw"
              onMouseDown={(e) => handleResizeMouseDown(widget.id, 'sw', e)}
            ></div>
            <div 
              className="resize-handle ne"
              onMouseDown={(e) => handleResizeMouseDown(widget.id, 'ne', e)}
            ></div>
            <div 
              className="resize-handle nw"
              onMouseDown={(e) => handleResizeMouseDown(widget.id, 'nw', e)}
            ></div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default InteractiveDashboard;