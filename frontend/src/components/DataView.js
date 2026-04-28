import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function DataView(props) {
  const currentDatabase = props.dbName;
  const currentTableName = props.tableName || props.table;
  const showToast = props.showToast;
  
  const [allRecords, setAllRecords] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWindow, setShowAddWindow] = useState(false);
  const [showEditWindow, setShowEditWindow] = useState(false);
  const [showDeleteWindow, setShowDeleteWindow] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
  const [errorText, setErrorText] = useState(null);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);

  useEffect(() => {
    if (currentDatabase && currentTableName) {
      loadAllRecords();
      loadTableStructure();
    } else {
      setAllRecords([]);
      setAllColumns([]);
    }
  }, [currentDatabase, currentTableName]);

  const loadAllRecords = async () => {
    if (!currentDatabase || !currentTableName) return;
    
    setIsLoading(true);
    setErrorText(null);
    try {
      const response = await axios.get(`${API_BASE}/${currentDatabase}/data/${currentTableName}`);
      const recordsList = response.data.records || [];
      setAllRecords(recordsList);
    } catch (err) {
      console.error('Ошибка:', err);
      setErrorText(err.response?.data?.detail || err.message);
      if (showToast) showToast(err.response?.data?.detail || err.message, 'error');
    }
    setIsLoading(false);
  };

  const loadTableStructure = async () => {
    if (!currentDatabase || !currentTableName) return;
    
    setIsLoadingStructure(true);
    try {
      const response = await axios.get(`${API_BASE}/${currentDatabase}/tables/${currentTableName}/columns`);
      const columnsInfo = response.data.columns || [];
      const columnNamesOnly = columnsInfo.map(col => col.name);
      setAllColumns(columnNamesOnly);
    } catch (err) {
      console.error('Ошибка структуры:', err);
      if (allRecords.length > 0) {
        setAllColumns(Object.keys(allRecords[0]));
      }
    }
    setIsLoadingStructure(false);
  };

  const addNewRecord = async () => {
    const { id, ...cleanData } = formValues;
    
    const requiredFields = allColumns.filter(col => col !== 'id');
    const emptyFields = requiredFields.filter(col => !cleanData[col] && cleanData[col] !== 0);
    
    if (emptyFields.length > 0) {
      if (showToast) showToast(`Заполните поля: ${emptyFields.join(', ')}`, 'warning');
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/${currentDatabase}/data/${currentTableName}`, { data: cleanData });
      await loadAllRecords();
      setFormValues({});
      setShowAddWindow(false);
      if (showToast) showToast('Запись добавлена', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  const editRecord = async () => {
    try {
      const { id, ...updateData } = formValues;
      await axios.put(`${API_BASE}/${currentDatabase}/data/${currentTableName}/${editingId}`, { data: updateData });
      await loadAllRecords();
      setFormValues({});
      setEditingId(null);
      setShowEditWindow(false);
      if (showToast) showToast('Запись обновлена', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  const deleteRecord = async () => {
    try {
      await axios.delete(`${API_BASE}/${currentDatabase}/data/${currentTableName}/${recordIdToDelete}`);
      await loadAllRecords();
      setShowDeleteWindow(false);
      setRecordIdToDelete(null);
      if (showToast) showToast('Запись удалена', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (showToast) showToast(errorMsg, 'error');
    }
  };

  const openAddWindow = () => {
    if (allColumns.length === 0) {
      if (showToast) showToast('Загрузка структуры... Попробуйте через секунду', 'warning');
      loadTableStructure();
      return;
    }
    const emptyForm = {};
    allColumns.forEach(col => {
      if (col !== 'id') {
        emptyForm[col] = '';
      }
    });
    setFormValues(emptyForm);
    setShowAddWindow(true);
  };

  const openEditWindow = (record) => {
    setEditingId(record.id);
    setFormValues(record);
    setShowEditWindow(true);
  };

  const openDeleteWindow = (recordId) => {
    setRecordIdToDelete(recordId);
    setShowDeleteWindow(true);
  };

  if (!currentDatabase) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '60px',
        textAlign: 'center',
        color: '#db7093',
        boxShadow: '0 8px 16px rgba(255,105,180,0.2)',
        border: '1px solid #ffb6c1'
      }}>
        🎀 Сначала выберите базу данных
      </div>
    );
  }

  if (!currentTableName) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)',
        borderRadius: '20px',
        padding: '60px',
        textAlign: 'center',
        color: '#db7093',
        boxShadow: '0 8px 16px rgba(255,105,180,0.2)',
        border: '1px solid #ffb6c1'
      }}>
        🎀 Выберите таблицу слева
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#db7093', fontSize: '20px' }}>
            🎀 Таблица: {currentTableName}
            <span style={{ fontSize: '14px', marginLeft: '10px', color: '#ff69b4' }}>
              {allRecords.length} записей
            </span>
          </h3>
          <button 
            onClick={openAddWindow}
            disabled={allColumns.length === 0}
            style={{
              background: allColumns.length === 0 ? '#ccc' : 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '8px 20px',
              cursor: allColumns.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Добавить запись
          </button>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff69b4' }}>Загрузка данных...</div>
        ) : errorText ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff1493' }}>
            Ошибка: {errorText}
            <br/>
            <button 
              onClick={() => { loadAllRecords(); loadTableStructure(); }} 
              style={{ marginTop: '15px', padding: '8px 16px', background: '#ff69b4', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
            >
              Повторить
            </button>
          </div>
        ) : allRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff69b4' }}>
            В этой таблице нет записей
            <br/>
            <button 
              onClick={openAddWindow}
              disabled={allColumns.length === 0}
              style={{ marginTop: '15px', padding: '10px 20px', background: allColumns.length === 0 ? '#ccc' : '#ff69b4', border: 'none', borderRadius: '10px', color: 'white', cursor: allColumns.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Добавить первую запись
            </button>
            {allColumns.length > 0 && (
              <div style={{ marginTop: '15px', fontSize: '12px', color: '#db7093' }}>
                Колонки: {allColumns.filter(c => c !== 'id').join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)', color: 'white' }}>
                  {allColumns.map((colName) => (
                    <th key={colName} style={{ padding: '12px', textAlign: 'left' }}>{colName}</th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((oneRecord, idx) => (
                  <tr 
                    key={oneRecord.id}
                    onDoubleClick={() => openEditWindow(oneRecord)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      const userChoice = window.confirm(`ID: ${oneRecord.id}\n\nOK - Редактировать\nОтмена - Удалить`);
                      if (userChoice) {
                        openEditWindow(oneRecord);
                      } else {
                        openDeleteWindow(oneRecord.id);
                      }
                    }}
                    style={{ 
                      background: idx % 2 === 0 ? '#fff5f8' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {allColumns.map((colName) => (
                      <td key={colName} style={{ padding: '10px', borderBottom: '1px solid #ffb6c1', color: '#666' }}>
                        {String(oneRecord[colName] || '')}
                      </td>
                    ))}
                    <td style={{ padding: '5px', textAlign: 'center' }}>
                      <button 
                        onClick={() => openEditWindow(oneRecord)}
                        style={{ 
                          background: '#ffb6c1',
                          color: '#db7093',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          marginRight: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => openDeleteWindow(oneRecord.id)}
                        style={{ 
                          background: '#ff69b4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showAddWindow && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }} onClick={() => setShowAddWindow(false)}>
          <div style={{ 
            background: '#fff0f5',
            borderRadius: '20px', width: '450px', maxWidth: '90%',
            border: '2px solid #ff69b4'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', borderBottom: '2px solid #ff69b4', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#db7093', margin: 0 }}>Добавление записи</h3>
              <button onClick={() => setShowAddWindow(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#db7093' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '450px', overflowY: 'auto' }}>
              {allColumns.filter(col => col !== 'id').map((colName) => (
                <div key={colName} style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#db7093', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px' }}>{colName}</label>
                  <input
                    type="text"
                    value={formValues[colName] || ''}
                    onChange={(e) => setFormValues({...formValues, [colName]: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid #ffb6c1', background: 'white' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #ffb6c1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddWindow(false)} style={{ padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Отмена</button>
              <button onClick={addNewRecord} style={{ padding: '8px 20px', background: '#ff69b4', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {showEditWindow && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }} onClick={() => setShowEditWindow(false)}>
          <div style={{ 
            background: '#fff0f5',
            borderRadius: '20px', width: '450px', maxWidth: '90%',
            border: '2px solid #ffb6c1'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', borderBottom: '2px solid #ffb6c1', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#db7093', margin: 0 }}>Редактирование</h3>
              <button onClick={() => setShowEditWindow(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#db7093' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              {allColumns.filter(col => col !== 'id').map((colName) => (
                <div key={colName} style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#db7093', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px' }}>{colName}</label>
                  <input
                    type="text"
                    value={formValues[colName] || ''}
                    onChange={(e) => setFormValues({...formValues, [colName]: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid #ffb6c1', background: 'white' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #ffb6c1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditWindow(false)} style={{ padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Отмена</button>
              <button onClick={editRecord} style={{ padding: '8px 20px', background: '#f39c12', border: 'none', borderRadius: '20px', color: '#1a1a2e', cursor: 'pointer' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteWindow && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }} onClick={() => setShowDeleteWindow(false)}>
          <div style={{ 
            background: '#fff0f5',
            borderRadius: '20px', width: '400px', maxWidth: '90%',
            border: '2px solid #ff1493'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px 20px', borderBottom: '2px solid #ff1493', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#db7093', margin: 0 }}>Удаление</h3>
              <button onClick={() => setShowDeleteWindow(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#db7093' }}>×</button>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#db7093', fontSize: '16px' }}>Удалить эту запись?</p>
              <p style={{ color: '#ff1493', fontSize: '14px', fontWeight: 'bold' }}>Действие необратимо!</p>
              <p style={{ color: '#ff69b4', fontSize: '12px', marginTop: '10px' }}>ID: {recordIdToDelete}</p>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #ffb6c1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteWindow(false)} style={{ padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Отмена</button>
              <button onClick={deleteRecord} style={{ padding: '8px 20px', background: '#ff1493', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DataView;