import React, { useState, useEffect } from 'react';
import { rbac, User } from '../services/rbac';

interface TeamMetric {
  userId: string;
  name: string;
  eventsCreated: number;
  tasksCompleted: number;
  stickersPlaced: number;
  collaborationScore: number;
  productivityScore: number;
}

interface TeamActivity {
  date: Date;
  eventType: 'event_created' | 'task_completed' | 'sticker_placed' | 'collaboration';
  userId: string;
  details: string;
}

const TeamAnalytics: React.FC = () => {
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    // Get all users from RBAC
    const users = rbac.getUsers();
    
    // Generate mock metrics for each user
    const metrics: TeamMetric[] = users.map(user => ({
      userId: user.id,
      name: user.name,
      eventsCreated: Math.floor(Math.random() * 50) + 10,
      tasksCompleted: Math.floor(Math.random() * 100) + 20,
      stickersPlaced: Math.floor(Math.random() * 30) + 5,
      collaborationScore: Math.floor(Math.random() * 100),
      productivityScore: Math.floor(Math.random() * 100)
    }));
    
    setTeamMetrics(metrics);
    
    // Generate mock activities
    const activities: TeamActivity[] = [];
    const eventTypes: TeamActivity['eventType'][] = ['event_created', 'task_completed', 'sticker_placed', 'collaboration'];
    
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      activities.push({
        date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        eventType: randomEventType,
        userId: randomUser.id,
        details: `Activity ${i + 1} details`
      });
    }
    
    setTeamActivities(activities);
  }, []);

  const filteredActivities = selectedUser === 'all' 
    ? teamActivities 
    : teamActivities.filter(activity => activity.userId === selectedUser);

  const filteredMetrics = selectedUser === 'all' 
    ? teamMetrics 
    : teamMetrics.filter(metric => metric.userId === selectedUser);

  const getEventTypeLabel = (eventType: TeamActivity['eventType']): string => {
    switch (eventType) {
      case 'event_created': return 'Event Created';
      case 'task_completed': return 'Task Completed';
      case 'sticker_placed': return 'Sticker Placed';
      case 'collaboration': return 'Collaboration';
      default: return eventType;
    }
  };

  const getEventTypeColor = (eventType: TeamActivity['eventType']): string => {
    switch (eventType) {
      case 'event_created': return '#007bff';
      case 'task_completed': return '#28a745';
      case 'sticker_placed': return '#ffc107';
      case 'collaboration': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getUserById = (userId: string): User | undefined => {
    return rbac.getUser(userId);
  };

  const overallProductivity = teamMetrics.reduce((sum, metric) => sum + metric.productivityScore, 0) / teamMetrics.length || 0;
  const overallCollaboration = teamMetrics.reduce((sum, metric) => sum + metric.collaborationScore, 0) / teamMetrics.length || 0;

  return (
    <div className="team-analytics">
      <div className="analytics-header">
        <h2>Team Analytics</h2>
        <div className="controls">
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">All Team Members</option>
            {rbac.getUsers().map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
          />
        </div>
      </div>
      
      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Team Productivity</h3>
          <div className="metric-value">{overallProductivity.toFixed(1)}%</div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${overallProductivity}%`, backgroundColor: '#28a745' }}
            ></div>
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Team Collaboration</h3>
          <div className="metric-value">{overallCollaboration.toFixed(1)}%</div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${overallCollaboration}%`, backgroundColor: '#007bff' }}
            ></div>
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Total Events</h3>
          <div className="metric-value">
            {teamMetrics.reduce((sum, metric) => sum + metric.eventsCreated, 0)}
          </div>
        </div>
        
        <div className="metric-card">
          <h3>Tasks Completed</h3>
          <div className="metric-value">
            {teamMetrics.reduce((sum, metric) => sum + metric.tasksCompleted, 0)}
          </div>
        </div>
      </div>
      
      <div className="analytics-content">
        <div className="metrics-table">
          <h3>Individual Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Events Created</th>
                <th>Tasks Completed</th>
                <th>Stickers Placed</th>
                <th>Productivity</th>
                <th>Collaboration</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map(metric => {
                const user = getUserById(metric.userId);
                return (
                  <tr key={metric.userId}>
                    <td>{user?.name || metric.userId}</td>
                    <td>{metric.eventsCreated}</td>
                    <td>{metric.tasksCompleted}</td>
                    <td>{metric.stickersPlaced}</td>
                    <td>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${metric.productivityScore}%`, backgroundColor: '#28a745' }}
                        ></div>
                        <span className="score-text">{metric.productivityScore}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${metric.collaborationScore}%`, backgroundColor: '#007bff' }}
                        ></div>
                        <span className="score-text">{metric.collaborationScore}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="activity-feed">
          <h3>Recent Activity</h3>
          <div className="activities-list">
            {filteredActivities
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((activity, index) => {
                const user = getUserById(activity.userId);
                return (
                  <div key={index} className="activity-item">
                    <div 
                      className="activity-icon"
                      style={{ backgroundColor: getEventTypeColor(activity.eventType) }}
                    >
                      {activity.eventType.charAt(0).toUpperCase()}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-user">{user?.name || activity.userId}</span>
                        <span className="activity-type">{getEventTypeLabel(activity.eventType)}</span>
                      </div>
                      <div className="activity-details">{activity.details}</div>
                      <div className="activity-time">
                        {activity.date.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default TeamAnalytics;