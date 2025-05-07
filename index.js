const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cohere = require('cohere-ai');
const app = express();

// Inicializa Cohere
cohere.init('r7car3d6eNIXGtAg3KNQooJL2zldT2UauEw3VIJr');

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

// Crear carpeta de comprobantes si no existe
if (!fs.existsSync('./comprobantes')) {
    fs.mkdirSync('./comprobantes');
}

client.on('qr', qr => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log(`🔷 Escanea este QR abriendo este enlace:\n${qrCodeUrl}`);
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO Y LISTO');
});

client.on('message', async message => {
    const msg = message.body.toLowerCase();
    const cliente = message.from;

    // Verificar si envían un comprobante como archivo o imagen
    if (message.hasMedia) {
        const media = await message.downloadMedia();

        // Simulación de validación (futuro: integrar OCR real o verificación contra base de datos)
        const esValido = Math.random() > 0.3; // 70% de probabilidad que sea válido

        if (esValido) {
            message.reply("✅ Comprobante verificado correctamente. En breve recibirás tu cuenta. Gracias por tu compra. 🙌");
        } else {
            message.reply("❌ El comprobante no parece válido. Por favor, revisa que la fecha, valor y nombre coincidan.");
        }

        // Guardar el archivo del comprobante
        const extension = media.mimetype.includes('image') ? 'jpg' : 'file';
        const fileName = `comprobante-${Date.now()}.${extension}`;
        fs.writeFileSync(`./comprobantes/${fileName}`, media.data, 'base64');
        return;
    }

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

    // Detectar mensaje de comprobante o pago por texto
    if (msg.includes('pagué') || msg.includes('comprobante') || msg.includes('factura') || msg.includes('transferencia')) {
        message.reply(`📩 ¡Gracias por tu pago!\nEstamos verificando tu comprobante. En breve recibirás tu cuenta. 🙌`);
        return;
    }

    // Combo
    if (msg.includes('combo')) {
        message.reply(`🎉 Combo especial:\nNetflix + Disney por solo $16.000\n💵 Solo pagos por Nequi o Transfiya al 3108336538`);
        return;
    }

    // Formas de pago
    if (msg.includes('pago') || msg.includes('nequi') || msg.includes('transfiya') || msg.includes('cómo pago')) {
        message.reply(`💳 Puedes pagar por Nequi o Transfiya al número 3108336538\nUna vez pagues, envíame el comprobante 📩`);
        return;
    }

    // Saludo
    if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey')) {
        message.reply(`👋 ¡Hola! Bienvenido(a) a tu tienda de streaming favorita.\nEscríbeme el nombre de la plataforma que deseas o escribe "combo" para conocer promociones 🎁`);
        return;
    }

    // Si no entendió nada, usar Cohere AI
    try {
        const response = await cohere.generate({
            model: 'command-nightly',
            prompt: message.body,
            max_tokens: 100,
            temperature: 0.7,
        });

        const respuesta = response.body.generations[0].text.trim();
        message.reply(respuesta);
    } catch (error) {
        message.reply("⚠️ No pude procesar tu mensaje en este momento. Intenta nuevamente más tarde.");
        console.error("Error con Cohere:", error.message);
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
