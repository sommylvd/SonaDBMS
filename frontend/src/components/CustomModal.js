import React from 'react';

function CustomModal({ isOpen, onClose, title, children, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '25px',
        width: '450px',
        maxWidth: '90%',
        boxShadow: '0 20px 60px rgba(255,105,180,0.3)',
        border: '2px solid #ffb6c1'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #ffb6c1',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0, color: '#db7093', fontSize: '22px' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#db7093',
            fontWeight: 'bold'
          }}>✕</button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          {children}
        </div>
        {onConfirm && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              padding: '8px 20px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#666'
            }}>Отмена</button>
            <button onClick={onConfirm} style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'white'
            }}>Подтвердить</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomModal;