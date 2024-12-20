import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';
import { default as cors } from 'cors';
import { error } from 'node:console';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

const port = 8000;

let app = express();
app.use(cors())
app.use(express.json());



/********************************************************************
 ***   DATABASE FUNCTIONS                                         *** 
 ********************************************************************/
// Open SQLite3 database (in read-write mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Create Promise for SQLite3 database SELECT query 
function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function dbRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/********************************************************************
 ***   REST REQUEST HANDLERS                                      *** 
 ********************************************************************/
// GET request handler for crime codes
app.get('/codes', (req, res) => {
    //console.log(req.query); // query object (key-value pairs after the ? in the url)
    let sqlQuery = 'Select * FROM Codes';
    let params = [];
    console.log(sqlQuery);

    if (req.query.hasOwnProperty('code')) {
        let code = req.query.code.split(',');
        console.log(code);
        sqlQuery += ' WHERE';
        for(let i = 0; i < code.length; i++) {
            sqlQuery += ' code = ?';
            params.push(code[i]);
            if(code[i + 1] != null) {
                sqlQuery += ' OR';
            }
        }
        console.log(sqlQuery);
        console.log(params);
    }


    dbSelect(sqlQuery, params)
    .then((rows) => {
        let codes = '[ ';
        rows.forEach((res) => {
            codes += '{"code": ' + res.code + ', "type": "' + res.incident_type + '"}, ';
            
        });
        codes = codes.slice(0, -2);
        codes += ' ]';
        codes = JSON.parse(codes);
        //console.log(codes);
        res.status(200).type('json').send(codes);
    })
    .catch((error) => {
        res.status(500).type('txt').send(error);
    });
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    //console.log(req.query); // query object (key-value pairs after the ? in the url)
    let sqlQuery = 'Select * FROM Neighborhoods';
    let params = [];
    console.log(sqlQuery);

    if (req.query.hasOwnProperty('id')) {
        let id = req.query.id.split(',');
        console.log(id);
        sqlQuery += ' WHERE';
        for(let i = 0; i < id.length; i++) {
            sqlQuery += ' neighborhood_number = ?';
            params.push(id[i]);
            if(id[i + 1] != null) {
                sqlQuery += ' OR';
            }
        }
        console.log(sqlQuery);
        console.log(params);
    }

    dbSelect(sqlQuery, params)
    .then((rows) => {
        let neighborhoods = '[ ';
        rows.forEach((item) => {
            neighborhoods += '{"id": ' + item.neighborhood_number + ', "name": "' + item.neighborhood_name + '"}, ';
        });
        neighborhoods = neighborhoods.slice(0, -2);
        neighborhoods += ' ]';
        neighborhoods = JSON.parse(neighborhoods);
        console.log(neighborhoods);
        res.status(200).type('json').send(neighborhoods);
    })
    .catch((error) => {
        res.status(500).type('txt').send(error);
    });
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    //console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    let sqlQuery = 'Select * FROM Incidents';
    let params = [];
    console.log(sqlQuery);

    
    if(req.query.hasOwnProperty('start_date') && req.query.hasOwnProperty('end_date')) {
        sqlQuery += ' WHERE ';
        sqlQuery += '(';
        sqlQuery += 'date_time BETWEEN ? AND ? ';
        params.push(req.query.end_date);
        params.push(req.query.start_date + 'T23:59:59');
        sqlQuery += ')';
    }
    if (req.query.hasOwnProperty('code')) {
        let code = req.query.code.split(',');
        if (req.query.hasOwnProperty('start_date')) {
            sqlQuery += 'AND';
        }
        else {
            sqlQuery += ' WHERE ';
        }
        //console.log(code);
        sqlQuery += '(';
        for(let i = 0; i < code.length; i++) {
            sqlQuery += ' code = ?';
            params.push(code[i]);
            if(code[i + 1] != null) {
                sqlQuery += ' OR';
            }
        }
        sqlQuery += ')';
    }
    if (req.query.hasOwnProperty('grid')) {
        let grid = req.query.grid.split(',');
        if (req.query.hasOwnProperty('code') || req.query.hasOwnProperty('start_date')) {
            sqlQuery += ' AND ';
        }
        else {
            sqlQuery += ' WHERE ';
        }
        sqlQuery += '(';
        for(let i = 0; i < grid.length; i++) {
            sqlQuery += ' police_grid = ?';
            params.push(grid[i]);
            if(grid[i + 1] != null) {
                sqlQuery += ' OR';
            }
        }
        sqlQuery += ')';
    }
    if (req.query.hasOwnProperty('neighborhood')) {
        let neighborhood = req.query.neighborhood.split(',');
        if (req.query.hasOwnProperty('code') || req.query.hasOwnProperty('grid') || req.query.hasOwnProperty('start_date')) {
            sqlQuery += ' AND ';
        }
        else {
            sqlQuery += ' WHERE ';
        }
        sqlQuery += '(';
        for(let i = 0; i < neighborhood.length; i++) {
            sqlQuery += ' neighborhood_number = ?';
            params.push(neighborhood[i]);
            if(neighborhood[i + 1] != null) {
                sqlQuery += ' OR';
            }
        }
        sqlQuery += ')';
    }
    sqlQuery += ' ORDER BY date_time DESC';
    if (req.query.hasOwnProperty('limit')) {
        sqlQuery += ' LIMIT ?';
        params.push(parseInt(req.query.limit));
    }
    else {
        sqlQuery += ' LIMIT ?';
        params.push(1000);
    }
    
    console.log(sqlQuery);
    console.log(params);

    dbSelect(sqlQuery, params)
    .then((rows) => {
        let incidents = '[ ';
        rows.forEach((item) => {
            incidents += '{"case_number": "' + item.case_number + '", ';
            let date = item.date_time;
            date = date.split("T");
            //console.log(date[0]);
            incidents += '"date": "' + date[0] + '", "time": "' + date[1] + '", "code": ' + item.code + ', "incident": "' + item.incident + '", "police_grid": ' + item.police_grid + ', "neighborhood_number": ' + item.neighborhood_number + ', "block": "' + item.block + '"}, ';
        });

        incidents = incidents.slice(0, -2);
        incidents += ' ]';
        incidents = JSON.parse(incidents);
        //console.log(incidents);

        res.status(200).type('json').send(incidents);
    })
    .catch((error) => {
        res.status(500).type('txt').send(error);
    });
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    const {
        case_number,
        date,
        time,
        code,
        incident,
        police_grid,
        neighborhood_number,
        block
    } = req.body;

    // Check if the case_number already exists in the database
    const checkIfExistsQuery = 'SELECT * FROM Incidents WHERE case_number = ?';
    const checkIfExistsParams = [case_number];

    dbSelect(checkIfExistsQuery, checkIfExistsParams)
        .then((rows) => {
            if (rows.length > 0) {
                // Case number already exists in the database
                throw(error);
            } else {
                // Case number doesn't exist, proceed with insertion
                const insertQuery = `
                    INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                const insertParams = [case_number, `${date}T${time}`, code, incident, police_grid, neighborhood_number, block];

                return dbRun(insertQuery, insertParams);
            }
        })
        .then(() => {
            res.status(200).type('txt').send('Incident added successfully');
        })
        .catch((error) => {
            res.status(500).type('txt').send(error);
        });
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    const { case_number } = req.body;

    const deleteQuery = 'DELETE FROM Incidents WHERE case_number = ?';
    const deleteParams = [case_number];

    db.run(deleteQuery, deleteParams, function (err) {
        if (err) {
            console.error('Error while deleting the incident:', err);
            return res.status(500).type('txt').send(err.message || 'Internal Server Error');
        }

        if (this.changes === 0) {
            return res.status(404).type('txt').send('Case number does not exist in the database');
        }

        return res.status(200).type('txt').send('Incident removed successfully');
    });
        
});

/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
