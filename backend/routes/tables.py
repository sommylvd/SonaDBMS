from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db, get_tables, get_table_columns_info
from crud import create_table, drop_table

router = APIRouter(prefix="/api/tables", tags=["tables"])

@router.get("/")
def list_tables(db: Session = Depends(get_db)):
    return {"tables": get_tables()}

@router.get("/{table_name}/columns")
def get_table_columns(table_name: str, db: Session = Depends(get_db)):
    """Получить список колонок таблицы"""
    try:
        columns = get_table_columns_info(table_name)
        return {"columns": columns}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/")
def create_new_table(table: dict, db: Session = Depends(get_db)):
    return create_table(db, table["name"], table["columns"])

@router.delete("/{table_name}")
def delete_table(table_name: str, db: Session = Depends(get_db)):
    return drop_table(db, table_name)