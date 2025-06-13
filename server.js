require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const usersFile = path.join(__dirname, 'users.json');

app.post('/payme/init', async (req, res) => {
    const amount = 990000;
    const order_id = Date.now().toString();
    const { name, phone } = req.body;

    const payload = {
        id: order_id,
        method: 'CreateInvoice',
        params: {
            amount,
            account: { order_id }
        }
    };

    try {
        const response = await axios.post(
            'https://checkout.test.paycom.uz/api',
            payload,
            {
                auth: {
                    username: process.env.PAYME_ID,
                    password: process.env.PAYME_KEY
                },
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Сохраняем имя и номер
        let users = [];
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile));
        }
        users.push({ name, phone, timestamp: new Date().toISOString() });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        const payUrl = response.data.result.invoice.pay_url;
        res.redirect(payUrl);
    } catch (error) {
        res.status(500).send('Ошибка при создании счёта');
    }
});

app.post('/payme/callback', (req, res) => {
    res.send({ result: { message: "OK" } });
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

app.post('/submit', (req, res) => {
    const { name, phone } = req.body;
    const userData = { name, phone, timestamp: new Date().toISOString() };

    let users = [];
    if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile));
    }
    users.push(userData);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.redirect('https://t.me/+L8r-7R_PISkzODQy');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
