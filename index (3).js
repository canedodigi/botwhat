
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const app = express();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

client.on('qr', qr => {
    const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(qr);
    console.log("🔷 Escanea este QR:");
    console.log(qrCodeUrl);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log("✅ BOT CONECTADO Y LISTO");
});

if (!fs.existsSync('./comprobantes')) fs.mkdirSync('./comprobantes');

client.on('message', async message => {
    const msg = message.body.toLowerCase();

    // Si el mensaje contiene una imagen (comprobante, captura, etc.)
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const nombre = "comprobante-" + Date.now() + ".jpg";
        fs.writeFileSync("./comprobantes/" + nombre, media.data, 'base64');

        return message.reply("🔍 *Revisando los datos del comprobante...*
Por favor espera un momento mientras validamos tu información. 🙌");
    }

    // Saludos
    if (msg.includes("hola") || msg.includes("buenas") || msg.includes("saludos")) {
        return message.reply("👋 ¡Hola! Bienvenido(a). ¿Qué plataforma deseas hoy? Netflix, Disney+, HBO Max, etc.");
    }

    // Mensajes relacionados con pagos
    const palabrasPago = ["pagué", "comprobante", "transferencia", "nequi", "bancolombia"];
    if (palabrasPago.some(p => msg.includes(p))) {
        return message.reply("📩 ¡Gracias por tu pago! Si no lo has hecho aún, por favor envíame una captura del comprobante.");
    }

    // Respuesta por defecto
    return message.reply("🤖 No entendí tu mensaje. ¿Podrías ser más claro?
Escríbeme el nombre de la plataforma que deseas o 'asistencia humana' si necesitas ayuda personalizada.");
});

app.get('/', (req, res) => {
    res.send("🤖 Bot de WhatsApp activo.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Servidor activo en http://localhost:" + PORT);
});

client.initialize();
