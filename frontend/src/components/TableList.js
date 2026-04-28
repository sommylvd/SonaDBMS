import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import CreateTableModal from './CreateTableModal';

const API_BASE = 'http://localhost:8000/api';

const TableList = forwardRef(({ dbName, onSelectTable, selectedTable, showToast }, ref) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadTables = async () => {
    if (!dbName) {
      setTables([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${dbName}/tables`);
      setTables(res.data.tables || []);
    } catch (err) {
      console.error('Error loading tables:', err);
      setTables([]);
      if (showToast) showToast(err.response?.data?.detail || err.message, 'error');
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ loadTables }));

  useEffect(() => {
    if (selectedTable) {
      onSelectTable(null);
    }
    loadTables();
  }, [dbName]);

  const handleCreateTable = async (tableName, columnsSQL) => {
    try {
      await axios.post(`${API_BASE}/${dbName}/tables`, { name: tableName, columns: columnsSQL });
      await loadTables();
      if (showToast) showToast(`Таблица "${tableName}" создана`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  const handleDropTable = async (table) => {
    try {
      await axios.delete(`${API_BASE}/${dbName}/tables/${table}`);
      await loadTables();
      if (selectedTable === table) onSelectTable(null);
      setDeleteConfirm(null);
      if (showToast) showToast(`Таблица "${table}" удалена`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  if (!dbName) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #ffb6c1',
        textAlign: 'center',
        color: '#db7093'
      }}>
        🎀 Сначала выберите базу данных
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 8px 16px rgba(255,105,180,0.2)',
        border: '1px solid #ffb6c1'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#db7093', fontSize: '20px' }}>🎀 Таблицы</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={loadTables}
              disabled={loading}
              style={{
                background: '#ffb6c1',
                color: '#db7093',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1
              }}
            >
              Обновить
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Создать
            </button>
          </div>
        </div>
        
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#ff69b4' }}>Загрузка...</div>}
        
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {tables.map(t => (
            <div
              key={t}
              onClick={() => onSelectTable(t)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (window.confirm(`Удалить таблицу "${t}"?`)) {
                  handleDropTable(t);
                }
              }}
              style={{
                padding: '12px',
                margin: '8px 0',
                background: selectedTable === t ? 'rgba(255,105,180,0.2)' : 'white',
                border: selectedTable === t ? '1px solid #ff69b4' : '1px solid #ffb6c1',
                color: selectedTable === t ? '#db7093' : '#db7093',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>🎀 {t}</span>
              <span style={{ fontSize: '11px', opacity: 0.7, color: '#ff69b4' }}>ПКМ</span>
            </div>
          ))}
        </div>
        
        {tables.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff69b4' }}>
            🎀 Нет таблиц<br/>
            Нажмите "Создать" чтобы начать
          </div>
        )}
      </div>

      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTable={handleCreateTable}
        showToast={showToast}
      />
    </>
  );
});

export default TableList;