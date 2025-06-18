require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYME_URL = 'https://checkout.paycom.uz/api'; // боевой
const usersFile = path.join(__dirname, 'users.json');

app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;
  const order_id = Date.now().toString();
  const amount = 990000; // 9900 сум × 100

  const payload = {
    method: 'receipts.create',
    params: {
      amount,
      account: {
        order_id,
        full_name: name, // добавили имя
        phone: phone     // добавили номер
      }
    }
  };

  try {
    const response = await axios.post(PAYME_URL, payload, {
      auth: {
        username: process.env.PAYME_ID,
        password: process.env.PAYME_KEY
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      console.error('Payme API error:', response.data.error);
      return res.status(500).send('Payme API error: ' + response.data.error.message);
    }

    const receiptId = response.data.result.receipt._id;

    // Сохраняем данные пользователя
    let users = [];
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile));
    }
    users.push({ name, phone, order_id, timestamp: new Date().toISOString() });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    // Редиректим на оплату Payme
    res.redirect(`https://checkout.paycom.uz/${receiptId}`);
  } catch (err) {
    console.error('Exception:', err.response?.data || err.message);
    res.status(500).send('Ошибка при создании чека.');
  }
});

app.listen(PORT, () => {
  console.log('Merchant API server ready on port', PORT);
});
