import { LayerState, CalendarEvent, DecorativeElement, HandwritingStroke, TaskItem } from '../types';

export class DataImportExportService {
  /**
   * Export calendar data to JSON format
   */
  static exportData(state: LayerState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import calendar data from JSON format
   */
  static importData(jsonData: string): LayerState {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validate the structure
      if (!this.isValidLayerState(parsedData)) {
        throw new Error('Invalid data structure');
      }
      
      return parsedData;
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export calendar data to a file
   */
  static exportToFile(state: LayerState, filename: string = 'artful-agenda-export.json'): void {
    const dataStr = this.exportData(state);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = filename;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Import calendar data from a file
   */
  static importFromFile(file: File): Promise<LayerState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const data = this.importData(result);
            resolve(data);
          } else {
            reject(new Error('Failed to read file'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Validate the structure of imported data
   */
  private static isValidLayerState(data: any): data is LayerState {
    // Check required properties
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check events array
    if (!Array.isArray(data.events)) {
      return false;
    }
    
    // Check decorations array
    if (!Array.isArray(data.decorations)) {
      return false;
    }
    
    // Check handwriting array
    if (!Array.isArray(data.handwriting)) {
      return false;
    }
    
    // Check tasks array
    if (!Array.isArray(data.tasks)) {
      return false;
    }
    
    // Check visibility object
    if (!data.visibility || typeof data.visibility !== 'object') {
      return false;
    }
    
    // Validate events
    for (const event of data.events) {
      if (!this.isValidEvent(event)) {
        return false;
      }
    }
    
    // Validate decorations
    for (const decoration of data.decorations) {
      if (!this.isValidDecoration(decoration)) {
        return false;
      }
    }
    
    // Validate handwriting
    for (const stroke of data.handwriting) {
      if (!this.isValidHandwriting(stroke)) {
        return false;
      }
    }
    
    // Validate tasks
    for (const task of data.tasks) {
      if (!this.isValidTask(task)) {
        return false;
      }
    }
    
    return true;
  }

  private static isValidEvent(event: any): event is CalendarEvent {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.id === 'string' &&
      typeof event.title === 'string' &&
      event.startTime instanceof Date &&
      event.endTime instanceof Date
    );
  }

  private static isValidDecoration(decoration: any): decoration is DecorativeElement {
    return (
      decoration &&
      typeof decoration === 'object' &&
      typeof decoration.id === 'string' &&
      typeof decoration.type === 'string' &&
      ['sticker', 'shape', 'text'].includes(decoration.type) &&
      decoration.position &&
      typeof decoration.position === 'object' &&
      typeof decoration.position.dateX === 'string' &&
      typeof decoration.position.offsetY === 'number' &&
      typeof decoration.position.zIndex === 'number' &&
      decoration.style &&
      typeof decoration.style === 'object' &&
      typeof decoration.style.width === 'number' &&
      typeof decoration.style.height === 'number' &&
      typeof decoration.style.rotation === 'number' &&
      typeof decoration.style.opacity === 'number'
    );
  }

  private static isValidHandwriting(stroke: any): stroke is HandwritingStroke {
    return (
      stroke &&
      typeof stroke === 'object' &&
      typeof stroke.id === 'string' &&
      stroke.position &&
      typeof stroke.position === 'object' &&
      typeof stroke.position.dateX === 'string' &&
      typeof stroke.position.offsetY === 'number' &&
      typeof stroke.position.zIndex === 'number' &&
      Array.isArray(stroke.bezierCurves) &&
      Array.isArray(stroke.pressure) &&
      typeof stroke.color === 'string' &&
      typeof stroke.width === 'number'
    );
  }

  private static isValidTask(task: any): task is TaskItem {
    return (
      task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.content === 'string' &&
      typeof task.completed === 'boolean' &&
      typeof task.date === 'string' &&
      ['low', 'medium', 'high'].includes(task.priority)
    );
  }
}