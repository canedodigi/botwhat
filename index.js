const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

const OPENAI_API_KEY = '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';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const productos = {
    netflix: { nombre: "Netflix", precio: "10.000" },
    disney: { nombre: "Disney+", precio: "6.500" },
    hbo: { nombre: "HBO Max", precio: "6.500" },
    crunchyroll: { nombre: "Crunchyroll", precio: "5.000" },
    amazon: { nombre: "Amazon Prime", precio: "5.000" },
    spotify: { nombre: "Spotify", precio: "8.500" }
};

client.on('qr', qr => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log(`🔷 Escanea este QR abriendo este enlace:
${qrCodeUrl}`);
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO Y LISTO');
});

client.on('message', async message => {
    const msg = message.body.toLowerCase();
    const cliente = message.from;

    // Guardar pedido si es producto
    for (const clave in productos) {
        if (msg.includes(clave)) {
            const p = productos[clave];
            const log = `[${new Date().toLocaleString()}] ${cliente} pidió ${p.nombre}\n`;
            fs.appendFileSync('pedidos.txt', log);
            message.reply(`📺 *${p.nombre}* cuesta $${p.precio}\n💳 Solo pagos por Nequi y Transfiya al 3108336538`);
            return;
        }
    }

    // Detectar mensaje de comprobante o pago
    if (msg.includes('pagué') || msg.includes('comprobante') || msg.includes('factura') || msg.includes('transferencia')) {
        message.reply(`📩 ¡Gracias por tu pago!
Estamos verificando tu comprobante. En breve recibirás tu cuenta. 🙌`);
        return;
    }

    // Combo
    if (msg.includes('combo')) {
        message.reply(`🎉 Combo especial:
Netflix + Disney por solo $16.000
💵 Solo pagos por Nequi o Transfiya al 3108336538`);
        return;
    }

    // Formas de pago
    if (msg.includes('pago') || msg.includes('nequi') || msg.includes('transfiya') || msg.includes('cómo pago')) {
        message.reply(`💳 Puedes pagar por Nequi o Transfiya al número 3108336538
Una vez pagues, envíame el comprobante 📩`);
        return;
    }

    // Saludo
    if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey')) {
        message.reply(`👋 ¡Hola! Bienvenido(a) a tu tienda de streaming favorita.
Escríbeme el nombre de la plataforma que deseas o escribe "combo" para conocer promociones 🎁`);
        return;
    }

    // Si no entendió nada, usar ChatGPT
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message.body }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const respuesta = response.data.choices[0].message.content.trim();
        message.reply(respuesta);
    } catch (error) {
        message.reply("⚠️ No pude procesar tu mensaje en este momento. Intenta nuevamente más tarde.");
        console.error("Error con OpenAI:", error.message);
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
