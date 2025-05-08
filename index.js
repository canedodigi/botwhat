
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const tesseract = require('tesseract.js');
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

    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const nombre = "comprobante-" + Date.now() + ".jpg";
        const ruta = "./comprobantes/" + nombre;
        fs.writeFileSync(ruta, media.data, 'base64');

        message.reply("📷 Recibido tu comprobante, verificando...");

        tesseract.recognize(ruta, 'spa', { logger: m => console.log(m) })
            .then(({ data: { text } }) => {
                const texto = text.toLowerCase();

                if (texto.includes("nequi") || texto.includes("bancolombia") || texto.includes("transferencia") || texto.includes("recibido") || texto.includes("$")) {
                    message.reply("✅ Comprobante válido detectado. En breve recibirás tu cuenta. Gracias por tu compra 🙌");
                } else {
                    message.reply("⚠️ El comprobante no parece válido o no se pudo leer claramente. Por favor asegúrate que esté legible y sin borrones.");
                }
            })
            .catch(err => {
                console.error("Error OCR:", err);
                message.reply("❌ Ocurrió un error al leer el comprobante. Intenta nuevamente o envía una imagen más clara.");
            });

        return;
    }

    // Saludo
    if (msg.includes("hola") || msg.includes("buenas") || msg.includes("saludos")) {
        return message.reply("👋 Hola, bienvenido. ¿Qué cuenta deseas comprar? Netflix, Disney+, HBO Max, Spotify o Amazon Prime.");
    }

    // Comprobantes por texto
    const comprobantesTexto = ["nequi", "bancolombia", "pagué", "transferencia", "comprobante", "factura"];
    if (comprobantesTexto.some(p => msg.includes(p))) {
        return message.reply("📩 Gracias por tu mensaje. Si ya pagaste, por favor envíame una foto clara del comprobante para validar tu pago.");
    }

    return message.reply("🤖 No entendí bien tu mensaje. ¿Podrías ser más específico? O escribe *'hablar con humano'* para asistencia directa.");
});

app.get('/', (req, res) => {
    res.send("🤖 Bot de WhatsApp con OCR activo.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Servidor activo en http://localhost:" + PORT);
});

client.initialize();
