import express from 'express'
import cors from 'cors'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())
app.use(express.json())

const PAYME_URL = 'https://checkout.paycom.uz/api'
const PAYME_ID = process.env.PAYME_ID
const PAYME_KEY = process.env.PAYME_KEY
const AUTH = Buffer.from(`${PAYME_ID}:${PAYME_KEY}`).toString('base64')

// Главная точка входа
app.post('/payme/init', async (req, res) => {
  const { name, phone } = req.body

  const payload = {
    id: Math.floor(Math.random() * 10000),
    method: 'receipts.create',
    params: {
      amount: 990000, // 9900 сум = 990000 тийин
      account: {
        order_id: uuidv4() // можно логировать вместе с name, phone
      },
      description: `Оплата подписки: ${name}, ${phone}`,
      detail: {
        receipt_type: 0,
        items: [
          {
            title: 'Подписка Habit Hero',
            price: 990000,
            count: 1,
            code: '123456789123456789', // любой ИКПУ код, можно тестовый
            units: 241092,
            vat_percent: 15,
            package_code: '000000'
          }
        ]
      }
    }
  }

  try {
    const paymeResponse = await axios.post(PAYME_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${AUTH}`
      }
    })

    const receiptId = paymeResponse.data.result.receipt._id
    const checkoutUrl = `https://checkout.paycom.uz/${receiptId}`

    res.status(200).json({ url: checkoutUrl })
  } catch (error) {
    console.error('Payme API error:', error?.response?.data || error.message)
    res.status(500).send('Ошибка Payme API')
  }
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
