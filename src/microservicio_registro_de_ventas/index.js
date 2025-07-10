const express = require('express');
const {Firestore} = require('@google-cloud/firestore');
const app = express();
const firestore = new Firestore();

app.use(express.json());

app.post('/registrar-venta', async (req, res) => {
  const {numero, monto, fecha} = req.body;
  if (!numero || !monto) return res.status(400).send("Datos incompletos");
  await firestore.collection('ventas').add({
    numero,
    monto,
    fecha: fecha || new Date().toISOString(),
    status: 'procesada'
  });
  res.send('Venta registrada');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servicio de Registro de Venta escuchando en ${PORT}`));