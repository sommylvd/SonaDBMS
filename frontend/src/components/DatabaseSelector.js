import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function DatabaseSelector({ onSelectDb, showToast }) {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [adminConfig, setAdminConfig] = useState({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: ''
  });
  const [newConnection, setNewConnection] = useState({
    name: '',
    host: 'localhost',
    port: '5432',
    database: '',
    user: 'postgres',
    password: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/databases`);
      setDatabases(response.data.databases || []);
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const createDatabase = async () => {
    if (!newDbName.trim()) {
      if (showToast) showToast('Введите имя базы данных', 'warning');
      return;
    }
    
    setCreating(true);
    try {
      const response = await axios.post(`${API_BASE}/databases/create`, {
        db_name: newDbName,
        admin_config: adminConfig
      });
      if (response.data.success) {
        if (showToast) showToast(`БД "${newDbName}" создана`, 'success');
        await loadDatabases();
        setShowCreateModal(false);
        setNewDbName('');
      } else {
        if (showToast) showToast(response.data.error, 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
    setCreating(false);
  };

  const addConnection = async () => {
    if (!newConnection.name.trim() || !newConnection.database.trim()) {
      if (showToast) showToast('Заполните имя и название БД', 'warning');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/databases`, newConnection);
      if (response.data.success) {
        if (showToast) showToast('Подключение добавлено', 'success');
        await loadDatabases();
        setShowAddModal(false);
        setNewConnection({
          name: '',
          host: 'localhost',
          port: '5432',
          database: '',
          user: 'postgres',
          password: ''
        });
      } else {
        if (showToast) showToast(response.data.error, 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  const deleteDatabase = async (dbName) => {
    if (!window.confirm(`Удалить "${dbName}"?`)) return;
    
    try {
      await axios.delete(`${API_BASE}/databases/${dbName}`);
      if (showToast) showToast('Удалено', 'success');
      await loadDatabases();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
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
        width: '500px',
        border: '2px solid #ffb6c1',
        boxShadow: '0 20px 60px rgba(255,105,180,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px' }}>🎀</div>
          <h2 style={{ color: '#db7093', marginTop: '10px' }}>Базы данных</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Создать БД
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)',
              color: '#db7093',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Добавить БД
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff69b4' }}>Загрузка...</div>
        ) : databases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#db7093' }}>
            Нет баз данных<br/>
            Нажмите "Создать БД" чтобы начать
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {databases.map(db => (
              <div
                key={db}
                onClick={() => onSelectDb(db)}
                style={{
                  padding: '15px',
                  margin: '10px 0',
                  background: 'white',
                  border: '1px solid #ffb6c1',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: '#db7093', fontSize: '16px' }}>🎀 {db}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteDatabase(db); }}
                  style={{ background: '#ff69b4', border: 'none', borderRadius: '20px', padding: '4px 12px', color: 'white', cursor: 'pointer' }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальные окна (без эмодзи) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '450px', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#db7093' }}>Создание БД</h3>
            <input type="text" placeholder="Имя БД" value={newDbName} onChange={e => setNewDbName(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Хост" value={adminConfig.host} onChange={e => setAdminConfig({...adminConfig, host: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Порт" value={adminConfig.port} onChange={e => setAdminConfig({...adminConfig, port: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Пользователь" value={adminConfig.user} onChange={e => setAdminConfig({...adminConfig, user: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="password" placeholder="Пароль" value={adminConfig.password} onChange={e => setAdminConfig({...adminConfig, password: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '10px' }}>Отмена</button>
              <button onClick={createDatabase} disabled={creating} style={{ flex: 1, padding: '10px', background: '#ff69b4', border: 'none', borderRadius: '10px', color: 'white' }}>{creating ? 'Создание...' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '450px', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#db7093' }}>Добавление БД</h3>
            <input type="text" placeholder="Имя подключения" value={newConnection.name} onChange={e => setNewConnection({...newConnection, name: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Хост" value={newConnection.host} onChange={e => setNewConnection({...newConnection, host: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Порт" value={newConnection.port} onChange={e => setNewConnection({...newConnection, port: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Имя БД" value={newConnection.database} onChange={e => setNewConnection({...newConnection, database: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="text" placeholder="Пользователь" value={newConnection.user} onChange={e => setNewConnection({...newConnection, user: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <input type="password" placeholder="Пароль" value={newConnection.password} onChange={e => setNewConnection({...newConnection, password: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '10px', border: '1px solid #ffb6c1' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '10px' }}>Отмена</button>
              <button onClick={addConnection} style={{ flex: 1, padding: '10px', background: '#ff69b4', border: 'none', borderRadius: '10px', color: 'white' }}>Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseSelector;