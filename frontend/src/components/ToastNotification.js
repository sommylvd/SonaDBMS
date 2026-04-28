import React, { useEffect } from 'react';

function ToastNotification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getColors = () => {
    switch(type) {
      case 'error':
        return { bg: '#ffebee', border: '#e74c3c', text: '#c0392b', icon: '❌' };
      case 'success':
        return { bg: '#e8f5e9', border: '#2ecc71', text: '#27ae60', icon: '✅' };
      case 'warning':
        return { bg: '#fff3e0', border: '#f39c12', text: '#e67e22', icon: '⚠️' };
      default:
        return { bg: '#e3f2fd', border: '#3498db', text: '#2980b9', icon: 'ℹ️' };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideInRight 0.3s ease'
    }}>
      <div style={{
        background: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px 20px',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{colors.icon}</span>
        <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>{message}</span>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#999',
          marginLeft: 'auto'
        }}>×</button>
      </div>
    </div>
  );
}

export default ToastNotification;