import React from 'react';
import { TaskItem } from '../types';

interface TaskLayerProps {
  tasks: TaskItem[];
  cellDimensions: { width: number; height: number };
  dateToPosition: (dateString: string) => { x: number; y: number };
  visibility: { tasks: boolean };
}

export const TaskLayer: React.FC<TaskLayerProps> = ({ 
  tasks, 
  cellDimensions, 
  dateToPosition, 
  visibility 
}) => {
  if (!visibility.tasks) return null;
  
  return (
    <>
      {tasks.map(task => {
        const position = dateToPosition(task.date);
        
        return (
          <div
            key={task.id}
            style={{
              position: 'absolute',
              left: position.x + 5,
              top: position.y + 70,
              width: cellDimensions.width - 10,
              fontSize: 11,
              color: task.completed ? '#9ca3af' : '#1f2937',
              textDecoration: task.completed ? 'line-through' : 'none',
              zIndex: 20
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => {}}
              style={{ marginRight: 4 }}
            />
            {task.content}
          </div>
        );
      })}
    </>
  );
};