
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

const productos = {
    netflix: "📺 *Netflix Premium* – $10.000
✔️ Plan 4K, 4 pantallas
✔️ Garantía incluida
💳 Nequi y Transfiya al 3108336538",
    disney: "📺 *Disney+* – $6.500
✔️ Catálogo completo: Marvel, Pixar, Star Wars
✔️ Hasta 4 dispositivos
💳 Nequi y Transfiya",
    hbo: "📺 *HBO Max* – $6.500
✔️ Todo HBO + Warner
✔️ Calidad Full HD y 4K
💳 Nequi y Transfiya",
    crunchyroll: "🍥 *Crunchyroll Premium* – $5.000
✔️ Acceso completo al anime
✔️ Sin anuncios
💳 Nequi y Transfiya",
    amazon: "📦 *Amazon Prime Video* – $5.000
✔️ Series y películas exclusivas
✔️ Incluye beneficios Prime
💳 Nequi y Transfiya",
    spotify: "🎧 *Spotify Premium* – $8.500
✔️ Música sin anuncios
✔️ Modo offline
💳 Nequi y Transfiya",
    combo: "🎁 *Combo Netflix + Disney+* – $16.000
✔️ Ahorra $500
💳 Nequi y Transfiya al 3108336538"
};

client.on('message', async message => {
    const msg = message.body.toLowerCase();

    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const nombre = "comprobante-" + Date.now() + ".jpg";
        fs.writeFileSync("./comprobantes/" + nombre, media.data, 'base64');

        return message.reply("🔍 *Revisando los datos del comprobante...*
Por favor espera un momento mientras validamos tu información. 🙌");
    }

    if (msg.includes("hola") || msg.includes("buenas") || msg.includes("saludos")) {
        return message.reply("👋 ¡Hola! Bienvenido(a). ¿Qué plataforma deseas hoy?
Escríbeme por ejemplo: *Netflix*, *Disney*, *combo*, *Spotify*");
    }

    for (const nombre in productos) {
        if (msg.includes(nombre)) {
            return message.reply(productos[nombre]);
        }
    }

    const palabrasPago = ["pagué", "comprobante", "transferencia", "nequi", "bancolombia"];
    if (palabrasPago.some(p => msg.includes(p))) {
        return message.reply("📩 ¡Gracias por tu pago! Si no lo has hecho aún, por favor envíame una captura del comprobante.");
    }

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
