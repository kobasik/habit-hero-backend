const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const merchantId = '682c6381dfc9ac0473670ecb';
const testAuth = 'Basic ' + Buffer.from('Paycom:iw9?YRYgtNC?A2f#3gFC4zYa6fn6#2MHC1Bj').toString('base64');

app.post('/pay', async (req, res) => {
    const { amount, order_id, name, phone } = req.body;
    try {
        const createReceipt = await axios.post('https://test.paycom.uz/api', {
            method: 'receipts.create',
            params: {
                amount: amount * 100, // сум -> тийин
                account: { order_id },
                merchant: merchantId
            }
        }, {
            headers: {
                Authorization: testAuth,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Создан платёж на ${amount} сум от ${name} (${phone})`);
        res.json(createReceipt.data);
    } catch (error) {
        console.error('Ошибка при создании чека:', error.response?.data || error.message);
        res.status(500).json({ error: error.toString() });
    }
});

app.post('/payme/callback', (req, res) => {
    console.log('Payme callback:', req.body);
    res.send({ result: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});