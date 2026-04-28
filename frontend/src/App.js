import React, { useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import DatabaseSelector from './components/DatabaseSelector';
import TableList from './components/TableList';
import DataView from './components/DataView';
import QueryEditor from './components/QueryEditor';
import ToastNotification from './components/ToastNotification';

function App() {
  const [connected, setConnected] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  if (!connected) {
    return <ConnectionForm onConnect={() => setConnected(true)} showToast={showToast} />;
  }

  if (!selectedDb) {
    return <DatabaseSelector onSelectDb={setSelectedDb} showToast={showToast} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffdde1 0%, #ffb6c1 50%, #ff69b4 100%)',
      fontFamily: "'Segoe UI', 'Quicksand', system-ui, sans-serif"
    }}>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #ffe4ec 100%)',
        boxShadow: '0 4px 20px rgba(255,105,180,0.2)',
        padding: '15px 30px',
        borderBottom: '3px solid #ff69b4'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#db7093', fontSize: '32px', fontWeight: 'bold' }}>
              🎀 Sona DBMS
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#ff69b4', fontSize: '12px' }}>
              Активная БД: {selectedDb}
            </p>
          </div>
          <button 
            onClick={() => setSelectedDb(null)}
            style={{
              background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '8px 20px',
              cursor: 'pointer'
            }}
          >
            Сменить БД
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', padding: '20px', gap: '20px', minHeight: 'calc(100vh - 100px)' }}>
        <div style={{ width: '320px' }}>
          <TableList 
            dbName={selectedDb}
            onSelectTable={setSelectedTable} 
            selectedTable={selectedTable} 
            showToast={showToast}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DataView 
            dbName={selectedDb}
            tableName={selectedTable} 
            showToast={showToast} 
          />
          <QueryEditor 
            dbName={selectedDb}
            showToast={showToast} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;