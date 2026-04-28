import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Таблицы
export const getTables = (dbName) => axios.get(`${API_BASE}/${dbName}/tables`);
export const getTableColumns = (dbName, tableName) => axios.get(`${API_BASE}/${dbName}/tables/${tableName}/columns`);
export const createTable = (dbName, name, columns) => axios.post(`${API_BASE}/${dbName}/tables`, { name, columns });
export const dropTable = (dbName, table) => axios.delete(`${API_BASE}/${dbName}/tables/${table}`);

// Данные
export const getData = (dbName, table) => axios.get(`${API_BASE}/${dbName}/data/${table}`);
export const insertRow = (dbName, table, data) => axios.post(`${API_BASE}/${dbName}/data/${table}`, { data });
export const updateRow = (dbName, table, id, data) => axios.put(`${API_BASE}/${dbName}/data/${table}/${id}`, { data });
export const deleteRow = (dbName, table, id) => axios.delete(`${API_BASE}/${dbName}/data/${table}/${id}`);

// Запросы
export const runQuery = (dbName, sql) => axios.post(`${API_BASE}/${dbName}/query`, { sql });