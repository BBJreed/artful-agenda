import React, { useState } from 'react';
import { useStore } from '../stores/appStore';

interface DatePickerProps {
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onClose }) => {
  const { selectedDate, setSelectedDate } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };
  
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onClose();
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    }
  };
  
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: 8 }}></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = isSameDay(date, selectedDate);
      const isCurrentDay = isToday(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isSelected ? '#3b82f6' : isCurrentDay ? '#dbeafe' : 'transparent',
            color: isSelected ? 'white' : isCurrentDay ? '#3b82f6' : '#1f2937',
            fontWeight: isSelected ? 'bold' : 'normal',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      width: 300,
      padding: 16
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <button 
          onClick={handlePrevMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4
          }}
        >
          ←
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select 
            value={currentMonth.getMonth()} 
            onChange={handleMonthChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14
            }}
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          
          <input
            type="number"
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            style={{
              width: 80,
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
              textAlign: 'center'
            }}
          />
        </div>
        
        <button 
          onClick={handleNextMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4
          }}
        >
          →
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 2,
        marginBottom: 8
      }}>
        {weekDays.map(day => (
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
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 2 
      }}>
        {renderCalendar()}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: 16 
      }}>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            onClose();
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
};