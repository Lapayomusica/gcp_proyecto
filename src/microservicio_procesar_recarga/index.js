const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.procesarRecarga = async (message, context) => {
    const data = message.json || JSON.parse(Buffer.from(message.data, 'base64').toString());
    // Simula procesamiento
    await firestore.collection('recargas').add({
      numero: data.numero,
      monto: data.monto,
      fecha: data.fecha || new Date().toISOString(),
      status: 'procesada'
    });
    console.log(`Recarga procesada para ${data.numero} por ${data.monto}`);
};