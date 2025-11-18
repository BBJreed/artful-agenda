import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100
  milestones: Milestone[];
  category: string;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'goal1',
      title: 'Learn React Native',
      description: 'Build a mobile app using React Native framework',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      priority: 'high',
      progress: 45,
      category: 'Learning',
      milestones: [
        { id: 'm1', title: 'Complete basic tutorial', completed: true },
        { id: 'm2', title: 'Build sample project', completed: true },
        { id: 'm3', title: 'Deploy to app stores', completed: false }
      ]
    },
    {
      id: 'goal2',
      title: 'Run a Marathon',
      description: 'Complete a full marathon (42.195 km)',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      priority: 'medium',
      progress: 20,
      category: 'Health',
      milestones: [
        { id: 'm4', title: 'Run 5K', completed: true },
        { id: 'm5', title: 'Run 10K', completed: false },
        { id: 'm6', title: 'Run half marathon', completed: false },
        { id: 'm7', title: 'Run full marathon', completed: false }
      ]
    }
  ]);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Personal'
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add a new goal
  const addGoal = () => {
    if (newGoal.title.trim() === '') return;
    
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      priority: newGoal.priority,
      progress: 0,
      category: newGoal.category,
      milestones: []
    };
    
    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      priority: 'medium',
      category: 'Personal'
    });
    setShowAddForm(false);
  };
  
  // Update goal progress
  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, progress: Math.max(0, Math.min(100, progress)) } : goal
    ));
  };
  
  // Toggle milestone completion
  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, completed: !milestone.completed } 
            : milestone
        );
        
        // Calculate new progress based on milestone completion
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const progress = updatedMilestones.length > 0 
          ? Math.round((completedMilestones / updatedMilestones.length) * 100)
          : goal.progress;
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress
        };
      }
      return goal;
    }));
  };
  
  // Delete a goal
  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    return differenceInDays(targetDate, today);
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
        <h2 style={{ margin: 0, color: '#1f2937' }}>Goal Tracker</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>
      
      {/* Add new goal form */}
      {showAddForm && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: 20,
          borderRadius: 6,
          marginBottom: 20,
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, marginBottom: 15, fontSize: 18, color: '#374151' }}>
            Create New Goal
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Goal Title *
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="What do you want to achieve?"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Category
              </label>
              <input
                type="text"
                value={newGoal.category}
                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                placeholder="e.g., Health, Career, Learning"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Target Date
              </label>
              <input
                type="date"
                value={newGoal.targetDate.toISOString().split('T')[0]}
                onChange={(e) => setNewGoal({...newGoal, targetDate: new Date(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Priority
              </label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as any})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  backgroundColor: 'white'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 5, 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Describe your goal in more detail..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: 20 
          }}>
            <button
              onClick={addGoal}
              disabled={newGoal.title.trim() === ''}
              style={{
                padding: '10px 20px',
                backgroundColor: newGoal.title.trim() === '' ? '#e5e7eb' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: newGoal.title.trim() === '' ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              Create Goal
            </button>
          </div>
        </div>
      )}
      
      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          No goals yet. Create your first goal to start tracking your progress!
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: 20 
        }}>
          {goals.map(goal => {
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;
            
            return (
              <div 
                key={goal.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 20,
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 15
                }}>
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: 5 
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: 18, 
                        color: '#1f2937',
                        marginRight: 10
                      }}>
                        {goal.title}
                      </h3>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: getPriorityColor(goal.priority),
                        color: 'white',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: '500'
                      }}>
                        {goal.priority}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: '#6b7280',
                      marginBottom: 10
                    }}>
                      {goal.category} • {format(goal.targetDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteGoal(goal.id)}
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
                    ×
                  </button>
                </div>
                
                {goal.description && (
                  <p style={{ 
                    margin: '0 0 15px 0', 
                    color: '#374151',
                    lineHeight: 1.5
                  }}>
                    {goal.description}
                  </p>
                )}
                
                {/* Progress bar */}
                <div style={{ marginBottom: 15 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: 5 
                  }}>
                    <span style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                      Progress
                    </span>
                    <span style={{ fontSize: 14, fontWeight: '500', color: '#3b82f6' }}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div style={{
                    height: 10,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 5,
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        width: `${goal.progress}%`,
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Days remaining */}
                <div style={{ 
                  marginBottom: 15,
                  padding: 10,
                  backgroundColor: isOverdue ? '#fee2e2' : '#dcfce7',
                  borderRadius: 6,
                  textAlign: 'center'
                }}>
                  <span style={{ 
                    color: isOverdue ? '#dc2626' : '#16a34a',
                    fontWeight: '500'
                  }}>
                    {isOverdue 
                      ? `Overdue by ${Math.abs(daysRemaining)} days` 
                      : `${daysRemaining} days remaining`}
                  </span>
                </div>
                
                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div>
                    <h4 style={{ 
                      margin: '0 0 10px 0', 
                      fontSize: 16, 
                      color: '#374151' 
                    }}>
                      Milestones
                    </h4>
                    <div style={{ 
                      maxHeight: 150, 
                      overflowY: 'auto',
                      paddingRight: 5
                    }}>
                      {goal.milestones.map(milestone => (
                        <div 
                          key={milestone.id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #f3f4f6'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={() => toggleMilestone(goal.id, milestone.id)}
                            style={{ 
                              width: 18, 
                              height: 18, 
                              marginRight: 10 
                            }}
                          />
                          <span style={{
                            textDecoration: milestone.completed ? 'line-through' : 'none',
                            color: milestone.completed ? '#9ca3af' : '#1f2937',
                            flex: 1
                          }}>
                            {milestone.title}
                          </span>
                          {milestone.dueDate && (
                            <span style={{ 
                              fontSize: 12, 
                              color: '#6b7280',
                              marginLeft: 10
                            }}>
                              {format(milestone.dueDate, 'MMM d')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Manual progress adjustment */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginTop: 15,
                  paddingTop: 15,
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <span style={{ 
                    fontSize: 14, 
                    color: '#374151',
                    marginRight: 10
                  }}>
                    Adjust Progress:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                    style={{ 
                      flex: 1,
                      marginRight: 10
                    }}
                  />
                  <button
                    onClick={() => updateGoalProgress(goal.id, 100)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: '500'
                    }}
                  >
                    Complete
                  </button>
                </div>
              </div>
            );
          })}
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
        <strong>SMART Goals:</strong> Make your goals Specific, Measurable, Achievable, Relevant, and Time-bound. 
        Break big goals into smaller milestones to track progress more effectively.
      </div>
    </div>
  );
};