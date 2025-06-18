const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const PAYME_URL = 'https://checkout.test.paycom.uz/api'; // для прода — без "test."
const X_AUTH = '682af6e35a11e938e9a1f84e:tRH9In2qH?UZrCoTjMVCBRSayiPui&RCwduk'; // ← подставь своё

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;
  const order_id = Date.now().toString();

  const payload = {
    method: "receipts.create",
    params: {
      amount: 990000,
      account: { order_id },
      description: "Оплата подписки"
    }
  };

  try {
    const response = await axios.post(PAYME_URL, payload, {
      headers: {
        'X-Auth': X_AUTH,
        'Content-Type': 'application/json'
      }
    });

    const receipt_id = response.data.result.receipt._id;
    const redirectUrl = `https://checkout.paycom.uz/${receipt_id}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Ошибка Payme:', err?.response?.data || err.message);
    res.status(500).send("Ошибка при создании счёта");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер на порту ${PORT}`));
