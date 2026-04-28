import React, { useState } from 'react';

function CreateTableModal({ isOpen, onClose, onCreateTable, showToast }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: 'name', type: 'VARCHAR(255)' }
  ]);

  const columnTypes = [
    'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)', 'VARCHAR(500)',
    'TEXT', 'INT', 'BIGINT', 'SMALLINT',
    'DECIMAL(10,2)', 'FLOAT', 'BOOLEAN', 'DATE',
    'TIMESTAMP', 'TIME', 'JSON', 'UUID'
  ];

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR(255)' }]);
  };

  const removeColumn = (index) => {
    if (columns.length === 1) {
      if (showToast) showToast('Таблица должна иметь хотя бы одну колонку', 'warning');
      return;
    }
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const updateColumnName = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].name = value;
    setColumns(newColumns);
  };

  const updateColumnType = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].type = value;
    setColumns(newColumns);
  };

  const generateSQL = () => {
    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) return 'name VARCHAR(255)';
    const columnDefs = validColumns.map(col => `${col.name} ${col.type}`);
    return columnDefs.join(', ');
  };

  const handleCreate = async () => {
    if (!tableName.trim()) {
      if (showToast) showToast('Введите название таблицы', 'warning');
      return;
    }
    
    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) {
      if (showToast) showToast('Добавьте хотя бы одну колонку', 'warning');
      return;
    }
    
    const columnNames = validColumns.map(col => col.name.toLowerCase());
    const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      if (showToast) showToast(`Повторяющиеся имена колонок: ${duplicates.join(', ')}`, 'error');
      return;
    }
    
    const sqlColumns = generateSQL();
    await onCreateTable(tableName, sqlColumns);
    setTableName('');
    setColumns([{ name: 'name', type: 'VARCHAR(255)' }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '550px',
        maxWidth: '90%',
        border: '2px solid #ff69b4',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '15px 20px',
          borderBottom: '2px solid #ff69b4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#db7093', margin: 0 }}>🎀 Создание таблицы</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer', 
              color: '#db7093',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
          {/* Название таблицы */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#db7093', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              Название таблицы
            </label>
            <input
              type="text"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="пример: users, products, orders"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '2px solid #ffb6c1',
                background: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Колонки */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#db7093', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              Колонки
            </label>
            
            {columns.map((col, index) => (
              <div key={index} style={{ 
                marginBottom: '10px', 
                padding: '10px',
                background: '#fff5f8',
                borderRadius: '12px',
                border: '1px solid #ffb6c1'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: '120px' }}>
                    <input
                      type="text"
                      value={col.name}
                      onChange={e => updateColumnName(index, e.target.value)}
                      placeholder="имя колонки"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ffb6c1',
                        background: 'white',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 2, minWidth: '140px' }}>
                    <select
                      value={col.type}
                      onChange={e => updateColumnType(index, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ff69b4',
                        background: 'white',
                        color: '#db7093',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {columnTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => removeColumn(index)}
                    style={{
                      background: '#ff69b4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Удалить
                  </button>
                </div>
                <div style={{ fontSize: '10px', color: '#db7093', marginTop: '5px' }}>
                  {col.type.includes('VARCHAR') && '📝 Текстовое поле'}
                  {col.type === 'INT' && '🔢 Целое число'}
                  {col.type === 'DECIMAL(10,2)' && '💰 Дробное число (цена)'}
                  {col.type === 'DATE' && '📅 Формат: ГГГГ-ММ-ДД'}
                  {col.type === 'BOOLEAN' && '✓ Да/Нет (true/false)'}
                  {col.type === 'TEXT' && '📄 Длинный текст'}
                  {col.type === 'TIMESTAMP' && '⏰ Дата и время'}
                </div>
              </div>
            ))}
            
            <button
              onClick={addColumn}
              style={{
                width: '100%',
                padding: '10px',
                background: '#ffb6c1',
                color: '#db7093',
                border: '1px dashed #ff69b4',
                borderRadius: '12px',
                cursor: 'pointer',
                marginTop: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              + Добавить колонку
            </button>
          </div>

          {/* SQL Preview */}
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #ff69b4'
          }}>
            <div style={{ color: '#ff69b4', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>
              🔍 Предпросмотр SQL
            </div>
            <pre style={{ 
              margin: 0, 
              color: '#2ecc71', 
              fontSize: '11px',
              fontFamily: 'monospace',
              overflowX: 'auto'
            }}>
              CREATE TABLE {tableName || 'название'} (
                id SERIAL PRIMARY KEY,
                {generateSQL()}
              );
            </pre>
          </div>
        </div>
        
        <div style={{ 
          padding: '15px 20px', 
          borderTop: '1px solid #ffb6c1', 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end' 
        }}>
          <button 
            onClick={onClose} 
            style={{ 
              padding: '8px 20px', 
              background: '#f0f0f0', 
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Отмена
          </button>
          <button 
            onClick={handleCreate} 
            style={{ 
              padding: '8px 20px', 
              background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)', 
              border: 'none', 
              borderRadius: '20px', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTableModal;