import React, { useState } from 'react';

interface AnalyticsData {
  id: string;
  name: string;
  value: number;
  details?: {
    [key: string]: any;
  };
  children?: AnalyticsData[];
}

const DrillDownAnalytics: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['overview']);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    id: 'overview',
    name: 'Overview',
    value: 100,
    children: [
      {
        id: 'productivity',
        name: 'Productivity',
        value: 85,
        details: {
          score: 85,
          trend: 'up',
          change: '+5%'
        },
        children: [
          {
            id: 'tasks',
            name: 'Task Completion',
            value: 92,
            details: {
              completed: 46,
              total: 50,
              onTime: 42
            },
            children: [
              {
                id: 'work',
                name: 'Work Tasks',
                value: 95,
                details: {
                  completed: 28,
                  total: 30,
                  onTime: 27
                }
              },
              {
                id: 'personal',
                name: 'Personal Tasks',
                value: 88,
                details: {
                  completed: 18,
                  total: 20,
                  onTime: 15
                }
              }
            ]
          },
          {
            id: 'events',
            name: 'Event Attendance',
            value: 78,
            details: {
              attended: 14,
              total: 18,
              missed: 4
            }
          }
        ]
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        value: 72,
        details: {
          score: 72,
          trend: 'down',
          change: '-3%'
        },
        children: [
          {
            id: 'meetings',
            name: 'Meetings',
            value: 80,
            details: {
              attended: 12,
              total: 15,
              avgDuration: '45m'
            }
          },
          {
            id: 'comments',
            name: 'Comments',
            value: 65,
            details: {
              given: 24,
              received: 18,
              responses: 15
            }
          }
        ]
      },
      {
        id: 'time-management',
        name: 'Time Management',
        value: 78,
        details: {
          score: 78,
          trend: 'up',
          change: '+8%'
        },
        children: [
          {
            id: 'punctuality',
            name: 'Punctuality',
            value: 85,
            details: {
              onTime: 34,
              total: 40,
              avgDelay: '2m'
            }
          },
          {
            id: 'scheduling',
            name: 'Scheduling',
            value: 71,
            details: {
              conflicts: 3,
              rescheduled: 5,
              optimized: 12
            }
          }
        ]
      }
    ]
  };

  const getCurrentData = (): AnalyticsData => {
    let currentData: AnalyticsData = analyticsData;
    
    for (const pathId of currentPath) {
      if (pathId === 'overview') continue;
      
      const child = currentData.children?.find(child => child.id === pathId);
      if (child) {
        currentData = child;
      } else {
        break;
      }
    }
    
    return currentData;
  };

  const navigateTo = (pathId: string) => {
    if (pathId === 'back') {
      if (currentPath.length > 1) {
        setCurrentPath(prev => prev.slice(0, -1));
      }
    } else {
      setCurrentPath(prev => [...prev, pathId]);
    }
    setSelectedMetric(null);
  };

  const formatValue = (value: number): string => {
    return `${value}%`;
  };

  const getValueColor = (value: number): string => {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    return '#dc3545';
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentData: AnalyticsData = analyticsData;
    
    breadcrumbs.push(
      <span 
        key="overview" 
        className={currentPath.length === 1 ? 'active' : 'link'}
        onClick={() => navigateTo('overview')}
      >
        Overview
      </span>
    );
    
    for (let i = 1; i < currentPath.length; i++) {
      const pathId = currentPath[i];
      const child = currentData.children?.find(child => child.id === pathId);
      
      if (child) {
        currentData = child;
        breadcrumbs.push(
          <span key={pathId}>
            {' > '}
            <span 
              className={i === currentPath.length - 1 ? 'active' : 'link'}
              onClick={() => setCurrentPath(prev => prev.slice(0, i + 1))}
            >
              {child.name}
            </span>
          </span>
        );
      }
    }
    
    return breadcrumbs;
  };

  const currentData = getCurrentData();

  return (
    <div className="drill-down-analytics">
      <div className="analytics-header">
        <h2>Drill-Down Analytics</h2>
        <div className="breadcrumbs">
          {currentPath.length > 1 && (
            <span className="back-link" onClick={() => navigateTo('back')}>
              ← Back
            </span>
          )}
          {renderBreadcrumbs()}
        </div>
      </div>
      
      <div className="analytics-content">
        <div className="main-metric">
          <div className="metric-header">
            <h3>{currentData.name}</h3>
            <div className="metric-value" style={{ color: getValueColor(currentData.value) }}>
              {formatValue(currentData.value)}
            </div>
          </div>
          
          {currentData.details && (
            <div className="metric-details">
              {Object.entries(currentData.details).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <span className="detail-label">{key}:</span>
                  <span className="detail-value">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {currentData.children && currentData.children.length > 0 && (
          <div className="sub-metrics">
            <h4>Drill Down Further</h4>
            <div className="metrics-grid">
              {currentData.children.map(child => (
                <div 
                  key={child.id}
                  className={`metric-card ${selectedMetric === child.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMetric(selectedMetric === child.id ? null : child.id)}
                >
                  <div className="card-header">
                    <h5>{child.name}</h5>
                    <div 
                      className="card-value" 
                      style={{ color: getValueColor(child.value) }}
                    >
                      {formatValue(child.value)}
                    </div>
                  </div>
                  
                  {selectedMetric === child.id && child.details && (
                    <div className="card-details">
                      {Object.entries(child.details).map(([key, value]) => (
                        <div key={key} className="detail-item">
                          <span className="detail-label">{key}:</span>
                          <span className="detail-value">{String(value)}</span>
                        </div>
                      ))}
                      <button 
                        className="drill-down-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(child.id);
                        }}
                      >
                        Explore Details →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="visualization">
          <h4>Performance Trend</h4>
          <div className="chart-container">
            <div className="y-axis">
              <div>100%</div>
              <div>75%</div>
              <div>50%</div>
              <div>25%</div>
              <div>0%</div>
            </div>
            <div className="chart-area">
              {/* Mock chart data */}
              <div className="chart-bar" style={{ height: '85%', backgroundColor: '#007bff' }}></div>
              <div className="chart-bar" style={{ height: '72%', backgroundColor: '#28a745' }}></div>
              <div className="chart-bar" style={{ height: '78%', backgroundColor: '#ffc107' }}></div>
            </div>
            <div className="x-axis">
              <div>Productivity</div>
              <div>Collaboration</div>
              <div>Time Mgmt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownAnalytics;