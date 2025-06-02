
const axios = require("axios");

const API_URL = "https://checkout.paycom.uz/api";
const BASIC_AUTH = process.env.PAYME_AUTH;
const MERCHANT_ID = process.env.PAYME_MERCHANT_ID;

async function fullFlow({ name, phone }) {
  const id = Date.now();

  // 1. Привязка карты
  const cardCreateRes = await axios.post(API_URL, {
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

  const data = cardCreateRes.data;

  if (data.error) throw new Error(data.error.message);

  const card = data.result.card;
  const token = card.token;
  const confirmUrl = card._links.confirm;

  // Ответ клиенту → пусть подтверждает карту
  return {
    message: "Подтвердите карту",
    confirmUrl,
    cardToken: token
  };
}

module.exports = { fullFlow };
