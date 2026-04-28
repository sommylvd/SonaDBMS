from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text, inspect
import json
import os
import urllib.parse

app = FastAPI(title="Sona DBMS", description="Multi-Database Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Хранилище подключений
connections = {}
connections_file = "connections.json"

if os.path.exists(connections_file):
    try:
        with open(connections_file, "r") as f:
            connections = json.load(f)
    except:
        pass

def save_connections():
    with open(connections_file, "w") as f:
        json.dump(connections, f)

def get_engine(db_name):
    if db_name not in connections:
        raise HTTPException(status_code=404, detail=f"Database '{db_name}' not found")
    config = connections[db_name]
    password_encoded = urllib.parse.quote_plus(str(config.get('password', '')))
    user_encoded = urllib.parse.quote_plus(str(config.get('user', 'postgres')))
    url = f"postgresql://{user_encoded}:{password_encoded}@{config['host']}:{config['port']}/{config['database']}"
    print(f"Creating engine for: {config['host']}:{config['port']}/{config['database']}")  # Отладка
    return create_engine(url, pool_pre_ping=True)

# ============ УПРАВЛЕНИЕ ПОДКЛЮЧЕНИЯМИ ============
@app.get("/api/databases")
def list_databases():
    return {"databases": list(connections.keys())}

@app.post("/api/databases")
def add_database(config: dict):
    name = config.get("name")
    if not name:
        return {"success": False, "error": "Name required"}
    
    connections[name] = {
        "host": config.get("host", "localhost"),
        "port": int(config.get("port", 5432)),
        "database": config.get("database"),
        "user": config.get("user", "postgres"),
        "password": config.get("password", "")
    }
    save_connections()
    return {"success": True}

@app.delete("/api/databases/{name}")
def remove_database(name: str):
    if name in connections:
        del connections[name]
        save_connections()
        return {"success": True}
    return {"success": False}

@app.post("/api/databases/create")
def create_database(data: dict):
    db_name = data.get("db_name")
    admin_config = data.get("admin_config")
    
    if not db_name:
        return {"success": False, "error": "Database name required"}
    if not admin_config:
        return {"success": False, "error": "Admin config required"}
    
    try:
        password_encoded = urllib.parse.quote_plus(str(admin_config.get("password", "")))
        user_encoded = urllib.parse.quote_plus(str(admin_config.get("user", "postgres")))
        url = f"postgresql://{user_encoded}:{password_encoded}@{admin_config['host']}:{admin_config['port']}/postgres"
        admin_engine = create_engine(url, pool_pre_ping=True)
        
        with admin_engine.connect() as conn:
            conn.execute(text("COMMIT"))
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
            conn.commit()
        
        connections[db_name] = {
            "host": admin_config.get("host", "localhost"),
            "port": int(admin_config.get("port", 5432)),
            "database": db_name,
            "user": admin_config.get("user", "postgres"),
            "password": admin_config.get("password", "")
        }
        save_connections()
        
        return {"success": True, "message": f"Database '{db_name}' created"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ============ РАБОТА С ТАБЛИЦАМИ ============
@app.get("/api/{db_name}/tables")
def get_tables(db_name: str):
    try:
        engine = get_engine(db_name)
        inspector = inspect(engine)
        return {"tables": inspector.get_table_names()}
    except Exception as e:
        print(f"Error getting tables: {e}")
        return {"tables": []}

@app.get("/api/{db_name}/tables/{table_name}/columns")
def get_table_columns(db_name: str, table_name: str):
    try:
        engine = get_engine(db_name)
        inspector = inspect(engine)
        columns = inspector.get_columns(table_name)
        return {"columns": [{"name": c["name"], "type": str(c["type"])} for c in columns]}
    except Exception as e:
        print(f"Error getting columns: {e}")
        return {"columns": []}

@app.post("/api/{db_name}/tables")
def create_table(db_name: str, table: dict):
    try:
        engine = get_engine(db_name)
        table_name = table.get("name")
        columns_sql = table.get("columns")
        
        sql = f'CREATE TABLE IF NOT EXISTS "{table_name}" (id SERIAL PRIMARY KEY, {columns_sql})'
        print(f"Executing SQL: {sql}")
        
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        
        return {"success": True, "message": f"Table {table_name} created"}
    except Exception as e:
        print(f"Error creating table: {e}")
        return {"success": False, "error": str(e)}

@app.delete("/api/{db_name}/tables/{table_name}")
def drop_table(db_name: str, table_name: str):
    try:
        engine = get_engine(db_name)
        sql = f'DROP TABLE IF EXISTS "{table_name}"'
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ============ РАБОТА С ДАННЫМИ ============
@app.get("/api/{db_name}/data/{table_name}")
def get_data(db_name: str, table_name: str):
    try:
        engine = get_engine(db_name)
        with engine.connect() as conn:
            result = conn.execute(text(f'SELECT * FROM "{table_name}"'))
            records = [dict(row._mapping) for row in result]
        return {"records": records}
    except Exception as e:
        print(f"Error getting data: {e}")
        return {"records": []}

@app.post("/api/{db_name}/data/{table_name}")
def insert_row(db_name: str, table_name: str, data: dict):
    try:
        engine = get_engine(db_name)
        clean_data = data.get("data", {})
        columns = ", ".join([f'"{k}"' for k in clean_data.keys()])
        values = ", ".join([f"'{str(v)}'" for v in clean_data.values()])
        sql = f'INSERT INTO "{table_name}" ({columns}) VALUES ({values})'
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.put("/api/{db_name}/data/{table_name}/{record_id}")
def update_row(db_name: str, table_name: str, record_id: int, data: dict):
    try:
        engine = get_engine(db_name)
        update_data = data.get("data", {})
        set_clause = ", ".join([f'"{k}" = \'{str(v)}\'' for k, v in update_data.items()])
        sql = f'UPDATE "{table_name}" SET {set_clause} WHERE id = {record_id}'
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/{db_name}/data/{table_name}/{record_id}")
def delete_row(db_name: str, table_name: str, record_id: int):
    try:
        engine = get_engine(db_name)
        sql = f'DELETE FROM "{table_name}" WHERE id = {record_id}'
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/{db_name}/query")
def execute_query(db_name: str, query: dict):
    try:
        engine = get_engine(db_name)
        with engine.connect() as conn:
            result = conn.execute(text(query["sql"]))
            if result.returns_rows:
                rows = [dict(row._mapping) for row in result]
                return {"success": True, "data": rows, "count": len(rows)}
            conn.commit()
            return {"success": True, "message": "Query executed"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)