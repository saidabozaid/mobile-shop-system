const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('خطأ الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('تم الاتصال بقاعدة البيانات MySQL بنجاح!');
    }
});

// --- 1. API المنتجات والمخزون ---
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, barcode, is_phone, buy_price, sell_price, stock_quantity } = req.body;
    const sql = 'INSERT INTO products (name, barcode, is_phone, buy_price, sell_price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, barcode, is_phone || false, buy_price, sell_price, stock_quantity || 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم إضافة المنتج بنجاح', id: result.insertId });
    });
});

// --- 2. API تذاكر الصيانة ---
app.get('/api/maintenance', (req, res) => {
    db.query('SELECT * FROM maintenance_orders ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/maintenance', (req, res) => {
    const { client_name, client_phone, device_model, imei_or_serial, problem_description, total_price } = req.body;
    const ticket_number = 'TICK-' + Math.floor(100000 + Math.random() * 900000);
    const sql = 'INSERT INTO maintenance_orders (ticket_number, client_name, client_phone, device_model, imei_or_serial, problem_description, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, "received")';
    
    db.query(sql, [ticket_number, client_name, client_phone, device_model, imei_or_serial, problem_description, total_price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم إنشاء كارت الصيانة بنجاح', ticket_number });
    });
});

// --- 3. API نقطة البيع (POS) والبحث وخصم المخزون ---
app.get('/api/products/search/:query', (req, res) => {
    const query = req.params.query;
    const sql = 'SELECT * FROM products WHERE barcode = ? OR name LIKE ?';
    db.query(sql, [query, `%${query}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/checkout', (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'السلة فارغة' });

    let completed = 0;
    items.forEach(item => {
        const sql = 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?';
        db.query(sql, [item.quantity, item.id, item.quantity], (err, result) => {
            completed++;
            if (completed === items.length) {
                res.json({ message: 'تم إتمام عملية البيع وخصم الكميات من المخزون بنجاح!' });
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
