from sqlalchemy.orm import Session
from sqlalchemy import text

def create_table(db: Session, table_name: str, columns: str):
    # Добавляем COLLATE для PostgreSQL
    sql = f'CREATE TABLE IF NOT EXISTS "{table_name}" (id SERIAL PRIMARY KEY, {columns})'
    db.execute(text(sql))
    db.commit()
    return {"message": f"Table {table_name} created"}

def drop_table(db: Session, table_name: str):
    sql = f'DROP TABLE IF EXISTS "{table_name}"'
    db.execute(text(sql))
    db.commit()
    return {"message": f"Table {table_name} dropped"}

def get_all_records(db: Session, table_name: str):
    result = db.execute(text(f'SELECT * FROM "{table_name}"'))
    return [dict(row._mapping) for row in result]

def insert_record(db: Session, table_name: str, data: dict):
    columns = ", ".join([f'"{k}"' for k in data.keys()])
    values = ", ".join([f"'{v}'" for v in data.values()])
    sql = f'INSERT INTO "{table_name}" ({columns}) VALUES ({values})'
    db.execute(text(sql))
    db.commit()
    return {"message": "Record inserted"}

def update_record(db: Session, table_name: str, record_id: int, data: dict):
    set_clause = ", ".join([f'"{k}" = \'{v}\'' for k, v in data.items()])
    sql = f'UPDATE "{table_name}" SET {set_clause} WHERE id = {record_id}'
    db.execute(text(sql))
    db.commit()
    return {"message": "Record updated"}

def delete_record(db: Session, table_name: str, record_id: int):
    sql = f'DELETE FROM "{table_name}" WHERE id = {record_id}'
    db.execute(text(sql))
    db.commit()
    return {"message": "Record deleted"}