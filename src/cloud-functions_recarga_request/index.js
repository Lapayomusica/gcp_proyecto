const express = require('express');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const app = express();
app.use(express.json());

app.post('/recarga', async (req, res) => {
  const {numero, monto} = req.body;
  if (!numero || !monto) return res.status(400).send('Datos incompletos');
  await pubsub.topic('recargas').publishMessage({ json: { numero, monto, fecha: new Date().toISOString() }});
  res.status(200).send('Recarga recibida');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Escuchando en ${PORT}`));
