const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const endPointRoot = "/API/v1"
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '',
    database: 'local_isa'
})

db.connect(err => {
    if (err) throw err;
    console.log("Connected to DB!");
})

db.promise = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) { reject(new Error()); }
            else { resolve(result); }
        })
    })
}

// Middleware
const RequestLogger = (req, res, next) => {
    console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
    next();
}

app.use(RequestLogger)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next();
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/frontend/', express.static(path.join(__dirname, '../frontend')))
app.use('/build/', express.static(path.join(__dirname, '../node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, '../node_modules/three/examples/jsm')))
app.use('/dat.gui/', express.static(path.join(__dirname, '../node_modules/dat.gui')))

// 3 POST
// 2 DELETE
// 2 PUT
// 1 GET

app.get("/color", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/shape", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/gallery", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/admin.html", (req, res) => {
    // Create pin table
    const sql = "CREATE TABLE IF NOT EXISTS pin (id int AUTO_INCREMENT PRIMARY KEY, type int, content TEXT CHARSET utf8mb4, lat float, lon float) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci";
    db.query(sql, (err, result) => {
        if (err) throw err;
    })

    // Create requests table
    const sql2 = "CREATE TABLE IF NOT EXISTS requests (gets int, posts int, puts int, deletes int)";
    db.query(sql2, (err, result) => {
        if (err) throw err;
    })

    // Create user table
    const sql3 = "CREATE TABLE IF NOT EXISTS user (id int AUTO_INCREMENT PRIMARY KEY, email varchar(255), password varchar(255))";
    db.query(sql3, (err, result) => {
        if (err) throw err;
    })

    // Get all requests
    const sql4 = "SELECT * FROM requests"
    db.query(sql4, (err, result) => {
        if (err) throw err;
    })
    // console.log(req.body)
    res.sendFile(path.join(__dirname, '../frontend/admin.html'))
})

app.post("/login", async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    db.promise(`SELECT * FROM user WHERE email= '${email}'`)
        .then((result) => {
            if (result.length == 0) {
                res.status(401).send()
                throw "Login failed, invalid email or password!"
            } else {
                bcrypt.compare(password, result[0].password)
                    .then((result) => {
                        if (result) {
                            res.status(200).send()
                        } else {
                            res.status(401).send()
                        }
                    })
            }
        }).catch((err) => {
            console.log(err);
        })
})

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get('/pins', (req, res) => {
    db.promise(`SELECT * FROM pin`)
    .then((result) => {
        console.log(JSON.stringify(result));
        res.setHeader('Content-Type', 'application/json');
       res.status(200).send(JSON.stringify(result));
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/documentation.html", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/documentation/index.html'))
})

app.post('/newEmoji', function (req, res) {
    const lat = req.body.lat
    const lon = req.body.lon
    const contentType = req.body.contentType
    const pinContent = req.body.pinContent
    const sql = `INSERT INTO pin (type, content, lat, lon) VALUES (${contentType}, "${pinContent}", ${lat}, ${lon})`;
    db.query(sql, (err, result) => {
        if (err) throw err
    })
})

app.listen(PORT, () => {
    console.log("Server on port " + PORT);
})