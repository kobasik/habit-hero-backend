require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PAYME_URL = 'https://checkout.paycom.uz/api';

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;
  const order_id = Date.now().toString();
  const amount = 990000; // 9900 сум в тийинах

  const payload = {
    method: 'receipts.create',
    params: {
      amount,
      account: {
        order_id,
      },
      description: `Оплата от ${name}, ${phone}`,
    },
  };

  try {
    const response = await axios.post(PAYME_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': process.env.PAYME_ID + ':' + process.env.PAYME_KEY,
      },
    });

    if (response.data.error) {
      return res.status(500).send('Payme API error: ' + response.data.error.message);
    }

    const receiptId = response.data.result.receipt._id;
    const redirectUrl = `https://checkout.paycom.uz/${receiptId}`;
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    return res.status(500).send('Ошибка при соединении с Payme API');
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
