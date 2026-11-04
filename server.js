const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('<h1 style="text-align:center; margin-top:50px;">📱 برنامج إدارة محل الموبايلات والصيانة يعمل بنجاح!</h1>');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
