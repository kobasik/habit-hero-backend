
const axios = require("axios");

const API_URL = "https://checkout.test.paycom.uz/api";
const X_AUTH = process.env.PAYME_AUTH;

async function fullFlow({ name, phone }) {
  const id = Date.now();

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
      "X-Auth": X_AUTH,
      "Content-Type": "application/json"
    }
  });

  const data = cardCreateRes.data;

  if (data.error) {
    throw new Error(data.error.message || "Ошибка при создании карты");
  }

  const result = data.result;
  const cardToken = result.card.token;
  const confirmUrl = result.card._links.confirm;

  return {
    message: "Подтвердите карту",
    confirmUrl,
    cardToken
  };
}

module.exports = { fullFlow };
