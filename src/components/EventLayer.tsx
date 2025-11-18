import React from 'react';
import { CalendarEvent } from '../types';

interface EventLayerProps {
  events: CalendarEvent[];
  cellDimensions: { width: number; height: number };
  dateToPosition: (dateString: string) => { x: number; y: number };
  visibility: { events: boolean };
}

export const EventLayer: React.FC<EventLayerProps> = ({ 
  events, 
  cellDimensions, 
  dateToPosition, 
  visibility 
}) => {
  if (!visibility.events) return null;
  
  return (
    <>
      {events.map(event => {
        const position = dateToPosition(event.startTime.toISOString());
        const eventHeight = 40;
        
        return (
          <div
            key={event.id}
            style={{
              position: 'absolute',
              left: position.x + 5,
              top: position.y + 25,
              width: cellDimensions.width - 10,
              height: eventHeight,
              backgroundColor: event.color || '#3b82f6',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 12,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            {event.title}
          </div>
        );
      })}
    </>
  );
};