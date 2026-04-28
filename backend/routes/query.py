from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/api/query", tags=["query"])

class QueryModel(BaseModel):
    sql: str

@router.post("/")
def execute_query(query: QueryModel, db: Session = Depends(get_db)):
    try:
        result = db.execute(text(query.sql))
        if result.returns_rows:
            return {"result": [dict(row._mapping) for row in result]}
        db.commit()
        return {"result": {"message": "Query executed", "rowcount": result.rowcount}}
    except Exception as e:
        return {"error": str(e)}