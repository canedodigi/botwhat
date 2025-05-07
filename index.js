const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('🔷 Escanea el código QR con tu WhatsApp');
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO');
});

client.on('message', message => {
    if (message.body.toLowerCase() === 'hola') {
        message.reply('¡Hola! Soy tu bot de WhatsApp 🤖');
    }
});

client.initialize();

app.get('/', (req, res) => {
    res.send('Bot de WhatsApp activo ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
