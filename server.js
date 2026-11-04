const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    } else {
        console.log('تم الاتصال بقاعدة البيانات MySQL بنجاح!');
    }
});

app.get('/', (req, res) => {
    res.send('<h1 style="text-align:center; margin-top:50px;">📱 نظام إدارة محل الموبايلات يعمل وقاعدة البيانات متصلة!</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
