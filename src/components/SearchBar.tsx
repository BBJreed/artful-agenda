import React, { useState } from 'react';
import { useStore } from '../stores/appStore';
import { CalendarEvent, TaskItem } from '../types';

interface SearchResult {
  type: 'event' | 'task';
  item: CalendarEvent | TaskItem;
  date: Date;
}

export const SearchBar: React.FC = () => {
  const { events, tasks } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    const searchResults: SearchResult[] = [];
    
    // Search in events
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(term.toLowerCase()))
      ) {
        searchResults.push({
          type: 'event',
          item: event,
          date: event.startTime
        });
      }
    });
    
    // Search in tasks
    tasks.forEach(task => {
      if (task.content.toLowerCase().includes(term.toLowerCase())) {
        searchResults.push({
          type: 'task',
          item: task,
          date: new Date(task.date)
        });
      }
    });
    
    // Sort by date
    searchResults.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setResults(searchResults);
    setIsOpen(true);
  };

  const handleResultClick = (result: SearchResult) => {
    const { setSelectedDate } = useStore.getState();
    
    if (result.type === 'event') {
      setSelectedDate(new Date((result.item as CalendarEvent).startTime));
    } else {
      setSelectedDate(new Date((result.item as TaskItem).date));
    }
    
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: 200 }}>
      <input
        type="text"
        placeholder="Search events and tasks..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 14
        }}
      />
      
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: 5
        }}>
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result)}
              style={{
                padding: '10px 15px',
                borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 4
              }}>
                <span style={{ 
                  fontWeight: 600, 
                  color: result.type === 'event' ? '#3b82f6' : '#10b981'
                }}>
                  {result.type === 'event' ? 'Event' : 'Task'}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {result.date.toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#1f2937' }}>
                {'title' in result.item ? result.item.title : result.item.content}
              </div>
              {'description' in result.item && result.item.description && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#6b7280', 
                  marginTop: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {result.item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};