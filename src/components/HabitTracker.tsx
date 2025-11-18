import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completions: Date[];
}

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 'habit1',
      name: 'Morning Meditation',
      color: '#8b5cf6',
      frequency: 'daily',
      completions: [
        new Date(new Date().setDate(new Date().getDate() - 2)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date()
      ]
    },
    {
      id: 'habit2',
      name: 'Exercise',
      color: '#10b981',
      frequency: 'daily',
      completions: [
        new Date(new Date().setDate(new Date().getDate() - 3)),
        new Date(new Date().setDate(new Date().getDate() - 1))
      ]
    },
    {
      id: 'habit3',
      name: 'Read 30 Minutes',
      color: '#3b82f6',
      frequency: 'daily',
      completions: [
        new Date(new Date().setDate(new Date().getDate() - 4)),
        new Date(new Date().setDate(new Date().getDate() - 2)),
        new Date()
      ]
    }
  ]);
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    color: '#3b82f6',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly'
  });
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Generate days for the current week
  const generateWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };
  
  const weekDays = generateWeekDays();
  
  // Check if a habit was completed on a specific day
  const isHabitCompleted = (habit: Habit, date: Date) => {
    return habit.completions.some(completion => isSameDay(completion, date));
  };
  
  // Toggle habit completion
  const toggleHabitCompletion = (habitId: string, date: Date) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = isHabitCompleted(habit, date);
        
        if (isCompleted) {
          // Remove completion
          return {
            ...habit,
            completions: habit.completions.filter(completion => !isSameDay(completion, date))
          };
        } else {
          // Add completion
          return {
            ...habit,
            completions: [...habit.completions, date]
          };
        }
      }
      return habit;
    }));
  };
  
  // Add a new habit
  const addHabit = () => {
    if (newHabit.name.trim() === '') return;
    
    const habit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabit.name,
      color: newHabit.color,
      frequency: newHabit.frequency,
      completions: []
    };
    
    setHabits([...habits, habit]);
    setNewHabit({
      name: '',
      color: '#3b82f6',
      frequency: 'daily'
    });
  };
  
  // Delete a habit
  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };
  
  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };
  
  // Calculate habit completion rate for the week
  const calculateCompletionRate = (habit: Habit) => {
    const completedDays = weekDays.filter(day => isHabitCompleted(habit, day)).length;
    return Math.round((completedDays / weekDays.length) * 100);
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
        <h2 style={{ margin: 0, color: '#1f2937' }}>Habit Tracker</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => navigateWeek('prev')}
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
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
          <button 
            onClick={() => navigateWeek('next')}
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
      
      {/* Add new habit form */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 6,
        marginBottom: 20,
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, marginBottom: 10, fontSize: 16, color: '#374151' }}>
          Add New Habit
        </h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            value={newHabit.name}
            onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
            placeholder="Habit name"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
          />
          <select
            value={newHabit.frequency}
            onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value as any})}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              backgroundColor: 'white'
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            type="color"
            value={newHabit.color}
            onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
            style={{
              width: 40,
              height: 40,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          />
          <button
            onClick={addHabit}
            disabled={newHabit.name.trim() === ''}
            style={{
              padding: '8px 16px',
              backgroundColor: newHabit.name.trim() === '' ? '#e5e7eb' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: newHabit.name.trim() === '' ? 'not-allowed' : 'pointer',
              fontWeight: 500
            }}
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Habits grid */}
      {habits.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          No habits yet. Add your first habit to get started!
        </div>
      ) : (
        <div style={{ 
          overflowX: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: 6
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  width: '30%'
                }}>
                  Habit
                </th>
                {weekDays.map((day, index) => (
                  <th 
                    key={index}
                    style={{ 
                      padding: '12px 5px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      minWidth: 40
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {format(day, 'EEE')}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                      {format(day, 'd')}
                    </div>
                  </th>
                ))}
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'center',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  width: '10%'
                }}>
                  Rate
                </th>
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'center',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  width: '10%'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, habitIndex) => (
                <tr 
                  key={habit.id}
                  style={{
                    backgroundColor: habitIndex % 2 === 0 ? 'white' : '#f9fafb',
                    borderBottom: habitIndex < habits.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  <td style={{ 
                    padding: '12px 15px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: habit.color,
                          borderRadius: '50%',
                          marginRight: 10
                        }}
                      ></div>
                      {habit.name}
                    </div>
                  </td>
                  
                  {weekDays.map((day, dayIndex) => {
                    const isCompleted = isHabitCompleted(habit, day);
                    
                    return (
                      <td 
                        key={dayIndex}
                        style={{ 
                          padding: '12px 5px',
                          textAlign: 'center'
                        }}
                      >
                        <button
                          onClick={() => toggleHabitCompletion(habit.id, day)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: '2px solid #e5e7eb',
                            backgroundColor: isCompleted ? habit.color : 'white',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isCompleted && (
                            <svg width="12" height="12" viewBox="0 0 12 12">
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  
                  <td style={{ 
                    padding: '12px 15px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: calculateCompletionRate(habit) >= 80 ? '#10b981' : 
                           calculateCompletionRate(habit) >= 50 ? '#f59e0b' : '#ef4444'
                  }}>
                    {calculateCompletionRate(habit)}%
                  </td>
                  
                  <td style={{ 
                    padding: '12px 15px',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => deleteHabit(habit.id)}
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <strong>Tip:</strong> Click on the circles to mark habits as completed for each day. 
        Green circles indicate completed habits. Your weekly completion rate is shown for each habit.
      </div>
    </div>
  );
};