from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sqlite3

app = FastAPI()

# SQLite3 database setup
conn = sqlite3.connect('stpaul_crime.sqlite3')
cursor = conn.cursor()

# Create a table if it doesn't exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS incidents (
        case_number INTEGER PRIMARY KEY,
        date TEXT,
        time TEXT,
        code TEXT,
        incident TEXT,
        police_grid INTEGER,
        neighborhood_number INTEGER,
        block TEXT
    )
''')
conn.commit()

# Pydantic models for request and response bodies
class Incident(BaseModel):
    case_number: int
    date: str
    time: str
    code: str
    incident: str
    police_grid: int
    neighborhood_number: int
    block: str

@app.put('/new-incident')
def new_incident(incident: Incident):
    # Check if case_number already exists
    cursor.execute('SELECT * FROM incidents WHERE case_number = ?', (incident.case_number,))
    existing_case = cursor.fetchone()

    if existing_case:
        raise HTTPException(status_code=500, detail='Case number already exists in the database')

    # Insert new incident into the database
    cursor.execute('''
        INSERT INTO incidents (case_number, date, time, code, incident, police_grid, neighborhood_number, block)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (incident.case_number, incident.date, incident.time, incident.code, incident.incident,
          incident.police_grid, incident.neighborhood_number, incident.block))
    conn.commit()

    return {'message': 'Incident data inserted successfully'}

@app.delete('/remove-incident')
def remove_incident(case_number: int):
    # Check if case_number exists
    cursor.execute('SELECT * FROM incidents WHERE case_number = ?', (case_number,))
    existing_case = cursor.fetchone()

    if not existing_case:
        raise HTTPException(status_code=404, detail='Case number does not exist in the database')

    # Remove incident from the database
    cursor.execute('DELETE FROM incidents WHERE case_number = ?', (case_number,))
    conn.commit()

    return {'message': 'Incident data removed successfully'}