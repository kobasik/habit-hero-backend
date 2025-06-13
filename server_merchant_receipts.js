require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYME_URL = 'https://checkout.test.paycom.uz/api'; // Тестовый endpoint

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const usersFile = path.join(__dirname, 'users.json');

app.post('/payme/init', async (req, res) => {
    const { name, phone } = req.body;
    const order_id = Date.now().toString();
    const amount = 990000; // 9900 сум * 100

    const payload = {
        method: "receipts.create",
        params: {
            amount,
            account: {
                order_id
            }
        }
    };

    try {
        const response = await axios.post(
            PAYME_URL,
            payload,
            {
                auth: {
                    username: process.env.PAYME_ID,
                    password: process.env.PAYME_KEY // Тестовый пароль из .env
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.error) {
            console.error('Payme API error:', response.data.error);
            return res.status(500).send('Payme API error: ' + response.data.error.message);
        }

        const receiptId = response.data.result.receipt._id;
        const payUrl = `https://checkout.test.paycom.uz/${receiptId}`;

        // Сохраняем данные клиента
        let users = [];
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile));
        }
        users.push({ name, phone, order_id, timestamp: new Date().toISOString() });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        res.redirect(payUrl);
    } catch (err) {
        console.error('Exception:', err?.response?.data || err.message);
        res.status(500).send('Ошибка при создании чека');
    }
});

app.listen(PORT, () => {
    console.log("Merchant API server ready on port", PORT);
});