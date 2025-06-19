
import express from 'express';
import cors from 'cors';

const app = express();

// Разрешаем запросы с Tilda
app.use(cors({
  origin: 'https://habituz.tilda.ws',
}));

import axios from 'axios';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();
app.use(bodyParser.json());

const PAYME_ID = process.env.PAYME_ID;
const PAYME_KEY = process.env.PAYME_KEY;

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).send("Имя и номер телефона обязательны");
  }

  try {
   const receipt = {
  id: Date.now(),
  method: 'receipts.create',
  params: {
    amount: 990000,
    account: {
      full_name: name,
      phone: phone
    },
    detail: {
      receipt_type: 0,
      items: [
        {
          title: "Подписка Habit Hero",
          price: 990000,
          count: 1,
          code: "0000000000000",
          units: 241092,
          vat_percent: 15,
          package_code: "000000"
        }
      ]
    }
  }
};

const response = await axios.post('https://checkout.paycom.uz/api', receipt, {
  headers: {
    'X-Auth': `${PAYME_ID}:${PAYME_KEY}`,
    'Content-Type': 'application/json'
  }
});

console.dir(response.data, { depth: null });

const receiptId = response.data.result.receipt._id;
const paymentLink = https://checkout.paycom.uz/${receipt_id}?redirect=https://t.me/+L8r-7R_PISkzODQy;
res.status(200).json({ link: paymentLink });

  } catch (error) {
    console.error("Ошибка при запросе в Payme:", error?.response?.data || error.message);
    res.status(500).send("Ошибка при создании чека через Payme");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
