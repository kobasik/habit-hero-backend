
const axios = require("axios");

const API_URL = "https://checkout.test.paycom.uz/api";
const BASIC_AUTH = Buffer.from(process.env.PAYME_LOGIN + ":" + process.env.PAYME_PASSWORD).toString("base64");
const MERCHANT_ID = process.env.PAYME_MERCHANT_ID;

async function fullFlow({ name, phone }) {
  const id = Date.now();

  // 1. Создаём карту (заглушка)
  const cardCreate = await axios.post(API_URL, {
    id: String(id),
    method: "cards.create",
    params: {
      card: {
        number: "8600123412341234",
        expire: "2504"
      },
      save: true
    }
  }, {
    headers: {
      "X-Auth": BASIC_AUTH,
      "Content-Type": "application/json"
    }
  });

  const result = cardCreate.data.result;
  const cardToken = result.card.token;
  const confirmUrl = result.card._links.confirm;

  // Ответ клиенту: пусть подтверждает карту
  return {
    message: "Подтвердите карту",
    confirmUrl,
    cardToken
  };
}

module.exports = { fullFlow };
