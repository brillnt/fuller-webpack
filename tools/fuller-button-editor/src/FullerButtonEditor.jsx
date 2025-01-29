// src/ClipPathEditor.jsx
import { useState, useMemo } from 'react';

export default function FullerButtonEditor() {
  const [x, setX] = useState(10);
  const [y, setY] = useState(10);
  const [buttonText, setButtonText] = useState('Learn More');
  
  const getClipPath = (x, y) => {
    return `polygon(0 0, ${100-x}% 0, 100% ${y}%, 100% 100%, ${x}% 100%, 0 ${100-y}%)`;
  };
  
  // Calculate angle between points
  const angle = useMemo(() => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 100-x, y: 0 };
    const p3 = { x: 100, y: y };
    
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    const angleRad = Math.acos(dotProduct / (v1Mag * v2Mag));
    return Math.round((angleRad * 180) / Math.PI);
  }, [x, y]);

  // CSS for our buttons
  const styles = `
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 200px;
      max-width: 100%;
      width: fit-content;
      padding: 1rem 2.5rem;
      margin: 0.25rem;
      color: #1A1A1A;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      text-decoration: none;
      text-transform: uppercase;
      white-space: nowrap;
      background-color: #6B8E9B;
      clip-path: ${getClipPath(x, y)};
      transition: transform 0.2s ease;
    }

    .button:hover {
      transform: translateY(-2px);
    }

    .btn-tertiary {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 200px;
      padding: 1rem 2.5rem;
      background-color: transparent;
      color: #1A1A1A;
      text-decoration: none;
      text-transform: uppercase;
    }

    .btn-tertiary::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: white;
      clip-path: ${getClipPath(x, y)};
    }

    .btn-tertiary::after {
      content: '';
      position: absolute;
      inset: 1px;
      background-color: transparent;
      clip-path: ${getClipPath(x, y)};
    }

    .btn-tertiary span {
      position: relative;
      z-index: 1;
    }
  `;

  return (
    <div style={{ padding: '24px', maxWidth: '48rem', margin: '0 auto' }}>
      <style>{styles}</style>
      
      <div style={{ marginBottom: '24px' }}>
        <label>
          X Value: {x}
          <input
            type="range"
            min="0"
            max="50"
            value={x}
            onChange={(e) => setX(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label>
          Y Value: {y}
          <input
            type="range"
            min="0"
            max="50"
            value={y}
            onChange={(e) => setY(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label>
          Button Text:
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </label>
      </div>

      <div style={{ 
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px'
      }}>
        Angle between points: {angle}°
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label>
          Clip Path Expression:
          <input
            type="text"
            readOnly
            value={getClipPath(x, y)}
            style={{ 
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              fontFamily: 'monospace'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label>
          Full CSS:
          <textarea
            readOnly
            value={styles}
            style={{ 
              width: '100%',
              height: '200px',
              padding: '8px',
              marginTop: '4px',
              fontFamily: 'monospace'
            }}
          />
        </label>
      </div>

      <div style={{ 
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '4px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Original Button Preview:</h3>
          <a href="#" className="button">
            {buttonText}
          </a>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px' }}>Bordered Button Preview:</h3>
          <a href="#" className="btn-tertiary">
            <span>{buttonText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}