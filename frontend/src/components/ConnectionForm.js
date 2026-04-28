import React, { useState } from 'react';

function ConnectionForm({ onConnect, showToast }) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('postgres');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');

  const connect = () => {
    const url = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    localStorage.setItem('db_url', url);
    onConnect();
    if (showToast) showToast('Подключение установлено', 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffdde1 0%, #ffb6c1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '30px',
        padding: '40px',
        width: '450px',
        border: '2px solid #ffb6c1',
        boxShadow: '0 20px 60px rgba(255,105,180,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px' }}>🎀</div>
          <h2 style={{ color: '#db7093', marginTop: '10px' }}>Подключение к БД</h2>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#db7093', fontWeight: '500' }}>Хост</label>
          <input 
            value={host} 
            onChange={e => setHost(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '2px solid #ffb6c1', background: 'white', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#db7093', fontWeight: '500' }}>Порт</label>
          <input 
            value={port} 
            onChange={e => setPort(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '2px solid #ffb6c1', background: 'white', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#db7093', fontWeight: '500' }}>База данных</label>
          <input 
            value={database} 
            onChange={e => setDatabase(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '2px solid #ffb6c1', background: 'white', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#db7093', fontWeight: '500' }}>Пользователь</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '2px solid #ffb6c1', background: 'white', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#db7093', fontWeight: '500' }}>Пароль</label>
          <input 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '2px solid #ffb6c1', background: 'white', fontSize: '14px' }}
          />
        </div>
        
        <button 
          onClick={connect}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(255,105,180,0.4)'
          }}
        >
          Подключиться
        </button>
      </div>
    </div>
  );
}

export default ConnectionForm;