import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../stores/appStore';
import { HandwritingStroke, BezierCurve } from '../types';

interface Point {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export const HandwritingInput: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  const { addStroke, selectedDate } = useStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);
  
  /**
   * Captures pointer events with pressure sensitivity support
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;
    
    setIsDrawing(true);
    setCurrentStroke([{ x, y, pressure, timestamp: Date.now() }]);
  };
  
  /**
   * Tracks pointer movement and accumulates stroke points
   */
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;
    
    const newPoint = { x, y, pressure, timestamp: Date.now() };
    const updatedStroke = [...currentStroke, newPoint];
    setCurrentStroke(updatedStroke);
    
    // Draw immediate feedback
    if (currentStroke.length > 0) {
      const lastPoint = currentStroke[currentStroke.length - 1];
      context.strokeStyle = strokeColor;
      context.lineWidth = strokeWidth * pressure;
      
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(x, y);
      context.stroke();
    }
  };
  
  /**
   * Completes stroke and converts to Bézier curves
   */
  const handlePointerUp = () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false);
      return;
    }
    
    const bezierCurves = convertToBezierCurves(currentStroke);
    const pressureValues = currentStroke.map(p => p.pressure);
    
    const stroke: HandwritingStroke = {
      id: `stroke-${Date.now()}`,
      position: {
        dateX: selectedDate.toISOString(),
        offsetY: 0,
        zIndex: 50
      },
      bezierCurves,
      pressure: pressureValues,
      color: strokeColor,
      width: strokeWidth
    };
    
    addStroke(stroke);
    clearCanvas();
    
    setIsDrawing(false);
    setCurrentStroke([]);
  };
  
  /**
   * Converts discrete points to smooth Bézier curve segments using Catmull-Rom interpolation
   */
  const convertToBezierCurves = (points: Point[]): BezierCurve[] => {
    if (points.length < 2) return [];
    
    const curves: BezierCurve[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      // Calculate control points using Catmull-Rom to cubic Bézier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      curves.push({
        startX: p1.x,
        startY: p1.y,
        controlPoint1X: cp1x,
        controlPoint1Y: cp1y,
        controlPoint2X: cp2x,
        controlPoint2Y: cp2y,
        endX: p2.x,
        endY: p2.y
      });
    }
    
    return curves;
  };
  
  /**
   * Clears canvas for next stroke
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label>
          Color:
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            style={{ marginLeft: 5 }}
          />
        </label>
        
        <label>
          Width:
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            style={{ marginLeft: 5 }}
          />
          <span style={{ marginLeft: 5 }}>{strokeWidth}px</span>
        </label>
        
        <button
          onClick={clearCanvas}
          style={{
            padding: '5px 15px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: 8,
          cursor: 'crosshair',
          touchAction: 'none'
        }}
      />
    </div>
  );
};