import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function QueryEditor({ dbName, onTableCreated, showToast }) {
  const [sql, setSql] = useState('SELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!dbName) {
      if (showToast) showToast('Сначала выберите базу данных', 'warning');
      return;
    }
    
    if (!sql.trim()) {
      if (showToast) showToast('Введите SQL запрос', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/${dbName}/query`, { sql });
      setResult(res.data);
      
      const sqlUpper = sql.toUpperCase().trim();
      if (sqlUpper.startsWith('CREATE TABLE') || sqlUpper.startsWith('DROP TABLE')) {
        if (onTableCreated) {
          onTableCreated();
        }
        if (showToast) showToast('Структура базы данных обновлена', 'success');
      }
      
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message });
      if (showToast) showToast(err.response?.data?.detail || err.message, 'error');
    }
    setLoading(false);
  };

  if (!dbName) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: '#db7093',
        border: '1px solid #ffb6c1'
      }}>
        🎀 Сначала выберите базу данных
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 8px 16px rgba(255,105,180,0.2)',
      border: '1px solid #ffb6c1'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#db7093', fontSize: '20px' }}>🎀 SQL Редактор</h3>
        <div style={{ fontSize: '12px', color: '#ff69b4' }}>
          CREATE, DROP, INSERT, SELECT, UPDATE, DELETE
        </div>
      </div>
      
      <textarea 
        rows="5" 
        value={sql} 
        onChange={e => setSql(e.target.value)}
        style={{
          width: '100%',
          fontFamily: 'Consolas, monospace',
          fontSize: '14px',
          padding: '12px',
          border: '2px solid #ffb6c1',
          borderRadius: '15px',
          resize: 'vertical',
          marginBottom: '10px',
          background: 'white'
        }}
        placeholder="Введите SQL запрос..."
      />
      
      <button 
        onClick={execute}
        disabled={loading}
        style={{
          padding: '10px 25px',
          background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Выполнение...' : 'Выполнить запрос'}
      </button>
      
      {/* Результат с ОГРАНИЧЕННОЙ ВЫСОТОЙ и скроллом */}
      {result && (
        <div style={{
          background: '#2d1b2a',
          color: '#ffb6c1',
          borderRadius: '15px',
          border: '1px solid #ff69b4',
          overflow: 'hidden',
          maxHeight: '250px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Заголовок результата */}
          <div style={{
            padding: '10px 15px',
            background: '#1a1a2e',
            borderBottom: '1px solid #ff69b4',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#ff69b4'
          }}>
            {result.error ? '❌ Ошибка выполнения' : (result.data ? `✅ Результат (${result.data.length} записей)` : '✅ Выполнено')}
          </div>
          
          {/* Содержимое с ограниченной высотой и скроллом */}
          <div style={{
            overflow: 'auto',
            maxHeight: '200px',
            padding: '12px'
          }}>
            <pre style={{
              margin: 0,
              fontFamily: 'Consolas, monospace',
              fontSize: '12px',
              color: result.error ? '#ff6b6b' : '#b2f5b2',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(result.error || (result.data || result.message), null, 2)}
            </pre>
          </div>
          
          {/* Кнопка закрытия */}
          <div style={{
            padding: '8px 15px',
            borderTop: '1px solid #ff69b4',
            textAlign: 'right',
            background: '#1a1a2e'
          }}>
            <button
              onClick={() => setResult(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffb6c1',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '5px'
              }}
            >
              ✕ Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueryEditor;