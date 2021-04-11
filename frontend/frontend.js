const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const endPointRoot = "/api/v1"

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next();
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/frontend/', express.static(path.join(__dirname, './')))
app.use('/build/', express.static(path.join(__dirname, '../node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, '../node_modules/three/examples/jsm')))
app.use('/dat.gui/', express.static(path.join(__dirname, '../node_modules/dat.gui')))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'))
})

app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, './documentation/index.html'))
})


app.listen(PORT, () => {
    console.log("Server on port " + PORT);
})