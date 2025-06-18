
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
const app = express();
app.use(bodyParser.json());

const PAYME_ID = process.env.PAYME_ID;
const PAYME_KEY = process.env.PAYME_KEY;

app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).send("Имя и номер телефона обязательны");
  }

  try {
    const response = await axios.post(
      'https://checkout.paycom.uz/api',
      {
        id: Math.floor(Math.random() * 100000),
        method: 'receipts.create',
        params: {
          amount: 990000, // 9900 сум в тийинах
          account: { order_id: phone },
          detail: {
            receipt_type: 0,
            items: [
              {
                title: "Подписка",
                price: 990000,
                count: 1,
                code: "12345678901234567890",
                units: 241092,
                vat_percent: 15,
                package_code: "123456"
              }
            ]
          }
        }
      },
      {
        headers: {
          'X-Auth': `${PAYME_ID}:${PAYME_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Payme response:", response.data);

    const receipt = response.data.result?.receipt;

    if (!receipt || !receipt._id) {
      console.error("Payme API: Некорректный ответ", response.data);
      return res.status(500).send("Payme API error: Некорректный ответ");
    }

    const receiptId = receipt._id;
    const paymentLink = `https://checkout.paycom.uz/${receiptId}`;

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
