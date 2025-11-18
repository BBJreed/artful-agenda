import React, { useState } from 'react';
import { useStore } from '../stores/appStore';
import { DecorativeElement } from '../types';

interface StickerToolbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StickerToolbar: React.FC<StickerToolbarProps> = ({ isOpen, onClose }) => {
  const { addDecoration, selectedDate } = useStore();
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState(40);
  
  // Sample sticker images - in a real app, these would come from a server or asset library
  const stickerImages = [
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/star_2b50.png',
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/heart-with-arrow_1f498.png',
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/sparkles_2728.png',
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/rocket_1f680.png',
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/sun-with-face_1f31e.png',
    'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/new-moon-face_1f31a.png'
  ];
  
  const handleStickerSelect = (imageUrl: string) => {
    const newSticker: DecorativeElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      position: {
        dateX: selectedDate.toISOString(),
        offsetY: 0,
        zIndex: 100
      },
      imageUrl,
      style: {
        width: size,
        height: size,
        rotation: rotation,
        opacity: 1
      }
    };
    
    addDecoration(newSticker);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 1000,
      width: 350
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15 
      }}>
        <h3 style={{ margin: 0 }}>Add Sticker</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0
          }}
        >
          ×
        </button>
      </div>
      
      {/* Sticker customization controls */}
      <div style={{ marginBottom: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ width: 80 }}>Size:</label>
          <input 
            type="range" 
            min="20" 
            max="100" 
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ marginLeft: 10, width: 40 }}>{size}px</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: 80 }}>Rotation:</label>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={rotation} 
            onChange={(e) => setRotation(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ marginLeft: 10, width: 40 }}>{rotation}°</span>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 15 
      }}>
        {stickerImages.map((url, index) => (
          <button
            key={index}
            onClick={() => handleStickerSelect(url)}
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              padding: 10,
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <img 
              src={url} 
              alt={`Sticker ${index + 1}`} 
              style={{ 
                width: size/2, 
                height: size/2, 
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`
              }} 
            />
          </button>
        ))}
      </div>
      
      <div style={{ 
        marginTop: 20, 
        padding: 10, 
        backgroundColor: '#f9fafb', 
        borderRadius: 6, 
        fontSize: 12 
      }}>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Click on a sticker to add it to today's date. You can move and resize stickers after adding them.
        </p>
      </div>
    </div>
  );
};