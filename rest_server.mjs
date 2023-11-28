import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

const port = 8000;

let app = express();
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

    dbSelect(sqlQuery, params)
    .then((rows) => {
        let codes = '[ ';
        rows.forEach((res) => {
            codes += '{"code": ' + res.code + ', "type": "' + res.incident_type + '"}, ';
            
        });
        codes = codes.slice(0, -2);
        codes += ' ]';
        codes = JSON.parse(codes);
        console.log(codes);
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
    
    let sqlQuery = 'Select * FROM Incidents LIMIT ?';
    let params = [1000];
    console.log(sqlQuery);

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
        console.log(incidents);

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
                res.status(500).type('txt').send('Case number already exists in the database');
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

// DELETE request handler for new crime incident 14172229
app.delete('/remove-incident', (req, res) => {
    const case_number  = req.query.case_number;
    console.log(req.query.case_number);

    const deleteQuery = 'DELETE FROM Incidents WHERE case_number = ?';
    const deleteParams = [case_number];

    dbRun(deleteQuery, deleteParams)
        .then((result) => {
            if (result.changes === 0) {
                // Case number doesn't exist in the database
                res.status(500).type('txt').send('Case number does not exist in the database');
            } else {
                res.status(200).type('txt').send('Incident removed successfully');
            }
        })
        .catch((error) => {
            res.status(500).type('txt').send(error);
        });
});

/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
