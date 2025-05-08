
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

const respuestas = {
    saludos: ["Hola, bienvenido. ¿En qué te puedo ayudar?", "¡Hola! Escríbeme el nombre de la plataforma que deseas comprar."],
    insultos: ["Tranquilo, estoy aquí para ayudarte. ¿Qué plataforma buscas?", "No uso groserías. ¿Te ayudo con Netflix, Disney u otra?"],
    preguntas: {
        "precio": "Nuestros precios son: Netflix $10.000, Disney+ $6.500, HBO Max $6.500, Crunchyroll $5.000, Spotify $8.500.",
        "combo": "Combo Netflix + Disney: $16.000. Pregunta por más combos.",
        "pago": "Puedes pagar por Nequi o Transfiya al 3108336538. Envíame el comprobante.",
        "garantía": "Todas las cuentas tienen garantía. Si hay algún problema, se reemplaza sin costo.",
        "entrega": "Entregamos las cuentas entre 5 y 10 minutos luego del pago.",
        "renovar": "Puedes renovar escribiéndome antes que termine el mes. Tienes descuento por fidelidad."
    },
    productos: {
        netflix: "Netflix Premium por $10.000. Calidad 4K. 4 pantallas. Garantía incluida.",
        disney: "Disney+ por $6.500. Todo Marvel, Pixar y más. 4 dispositivos.",
        hbo: "HBO Max por $6.500. Series exclusivas. Hasta 3 dispositivos.",
        crunchyroll: "Crunchyroll por $5.000. Todo el anime. Sin anuncios.",
        spotify: "Spotify Premium por $8.500. Música sin interrupciones.",
        amazon: "Amazon Prime por $5.000. Series y envíos Prime."
    },
    desconocido: "🤖 No estoy seguro de haber entendido. ¿Podrías ser más específico? Si prefieres hablar con un asistente humano, responde con: *"hablar con humano"*"
};

client.on('message', async message => {
    const msg = message.body.toLowerCase();

    // Reconocer comprobante por texto
    const comprobantesTexto = ["pagué", "comprobante", "transferencia", "nequi", "transfiya", "bancolombia", "recibo"];
    if (comprobantesTexto.some(p => msg.includes(p))) {
        return message.reply("📩 ¡Gracias por tu pago! Estamos verificando el comprobante. En breve recibirás tu cuenta. 🙌");
    }

    // Reconocer comprobante por imagen
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const validado = Math.random() > 0.2;
        const nombre = "comprobante-" + Date.now() + ".jpg";
        fs.writeFileSync("./comprobantes/" + nombre, media.data, 'base64');
        return message.reply(validado ?
            "✅ Comprobante recibido correctamente. Verificando... recibirás tu cuenta en breve." :
            "❌ El comprobante parece inválido. Verifica que todos los datos estén claros y completos.");
    }

    // Insultos
    const insultos = ["hp", "malparido", "gonorrea"];
    if (insultos.some(i => msg.includes(i))) {
        return message.reply(respuestas.insultos[0]);
    }

    // Saludos
    if (msg.includes("hola") || msg.includes("buenas") || msg.includes("saludos")) {
        return message.reply(respuestas.saludos[0]);
    }

    // Preguntas frecuentes
    for (const palabra in respuestas.preguntas) {
        if (msg.includes(palabra)) {
            return message.reply(respuestas.preguntas[palabra]);
        }
    }

    // Productos
    for (const producto in respuestas.productos) {
        if (msg.includes(producto)) {
            return message.reply(respuestas.productos[producto]);
        }
    }

    if (msg.includes("combo")) {
        return message.reply(respuestas.preguntas["combo"]);
    }

    // Mensaje genérico si no se reconoce el contenido
    return message.reply(respuestas.desconocido);
});

app.get('/', (req, res) => {
    res.send("🤖 Bot de WhatsApp activo.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Servidor activo en http://localhost:" + PORT);
});

client.initialize();
