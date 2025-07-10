const express = require('express');
const {Firestore} = require('@google-cloud/firestore');
const app = express();
const firestore = new Firestore();

app.use(express.json());

app.post('/actualizar-saldo', async (req, res) => {
  const {numero, monto} = req.body;
  if (!numero || !monto) return res.status(400).send("Datos incompletos");
  const docRef = firestore.collection('saldos').doc(numero);
  await firestore.runTransaction(async t => {
    const doc = await t.get(docRef);
    let saldoActual = doc.exists ? doc.data().saldo : 0;
    t.set(docRef, {saldo: saldoActual + Number(monto)});
  });
  res.send('Saldo actualizado');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Microservicio de Saldo escuchando en ${PORT}`));