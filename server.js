require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYME_URL = 'https://checkout.paycom.uz/api'; // БОЕВОЙ endpoint

app.use(cors());
app.use(bodyParser.json());

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;

  const order_id = Date.now().toString(); // любой уникальный ID
  const amount = 990000; // 9900 сум в тийинах

  const payload = {
    method: 'receipts.create',
    params: {
      amount,
      account: {
        order_id,
      },
    },
  };

  try {
    const response = await axios.post(PAYME_URL, payload, {
      auth: {
        username: process.env.PAYME_ID,
        password: process.env.PAYME_KEY,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      console.error('Payme API error:', response.data.error);
      return res.status(500).send('Ошибка Payme API: ' + response.data.error.message);
    }

    const receipt_id = response.data.result.receipt._id;
    const checkout_url = `https://checkout.paycom.uz/${receipt_id}`;

    res.json({ url: checkout_url });
  } catch (err) {
    console.error('Ошибка соединения с Payme:', err.message);
    res.status(500).send('Ошибка соединения с Payme: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
