
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
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
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log('🔷 Escanea este QR con tu celular:');
    console.log(qrCodeUrl);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO Y LISTO PARA ATENDER CLIENTES');
});

// Base de respuestas y servicios
const respuestas = {
    saludos: [
        "👋 ¡Hola! Soy tu asistente virtual para ayudarte con tus cuentas de streaming. ¿En qué puedo ayudarte hoy?",
        "¡Bienvenido a nuestro servicio premium! Escríbeme el nombre de la plataforma que deseas (Netflix, Disney+, HBO Max, etc.)."
    ],
    despedidas: [
        "¡Gracias por escribirnos! Estamos para servirte las 24 horas. ✨",
        "Cualquier otra duda, aquí estaré. ¡Hasta pronto! 👋"
    ],
    insultos: [
        "😅 Entiendo tu frustración, pero estoy aquí para ayudarte. ¿Qué servicio necesitas?",
        "👀 Mejor hablemos de plataformas premium. ¿Buscas Netflix, Disney+, o Spotify?"
    ],
    preguntasFrecuentes: {
        "precio": "💸 Nuestros precios son accesibles:
Netflix $10.000, Disney+ $6.500, HBO Max $6.500, Crunchyroll $5.000, Spotify $8.500. También tenemos combos especiales. ¿Quieres más información?",
        "pago": "💳 Aceptamos pagos por Nequi y Transfiya al número 3108336538. Envíanos tu comprobante y en minutos recibirás tu cuenta.",
        "garantía": "🔐 Todas nuestras cuentas tienen garantía. Si no funcionan, se reemplazan sin costo.",
        "combo": "🎁 Combo Netflix + Disney por $16.000. También tenemos paquetes familiares y completos.",
        "entrega": "🚀 Entregamos las cuentas entre 5 a 10 minutos después de recibir el comprobante de pago.",
        "duración": "🕒 Todas las cuentas duran mínimo 30 días. Muchos usuarios disfrutan hasta 3 meses.",
        "disponibilidad": "✅ Sí, tenemos disponibilidad de todas las plataformas. ¿Cuál necesitas?",
        "renovar": "♻️ Puedes renovar tu cuenta cuando esté por vencer. Incluso ofrecemos descuentos por fidelidad.",
        "plataformas": "📱 Puedes usar las cuentas en Smart TVs, celulares, tablets, laptops y consolas como PS5 o Xbox."
    },
    respuestaGenerica: [
        "📌 ¿Buscas una cuenta específica? Escríbeme: Netflix, Disney, HBO, Spotify, etc.",
        "No entendí bien tu mensaje. ¿Estás buscando información sobre precios, pagos o combos?",
        "Estoy para ayudarte con cuentas de streaming. Escríbeme el nombre de la plataforma que deseas."
    ]
};

const productos = {
    netflix: "📺 *Netflix Premium* - $10.000
✔️ Calidad 4K
✔️ 4 pantallas
✔️ Garantía incluida
💳 Paga por Nequi o Transfiya al 3108336538",
    disney: "📺 *Disney+* - $6.500
✔️ Películas de Disney, Marvel y Star Wars
✔️ Hasta 4 dispositivos
💳 Nequi/Transfiya al 3108336538",
    hbo: "📺 *HBO Max* - $6.500
✔️ Contenido exclusivo como The Last of Us, Euphoria y más
💳 Nequi o Transfiya",
    crunchyroll: "🍥 *Crunchyroll Premium* - $5.000
✔️ Acceso completo al anime
✔️ Sin anuncios
💳 Nequi/Transfiya",
    amazon: "📦 *Amazon Prime Video* - $5.000
✔️ Series exclusivas como The Boys
💳 Nequi/Transfiya",
    spotify: "🎧 *Spotify Premium* - $8.500
✔️ Música sin anuncios
✔️ Reproducción offline
💳 Nequi/Transfiya"
};

// Comprobantes
if (!fs.existsSync('./comprobantes')) fs.mkdirSync('./comprobantes');

client.on('message', async message => {
    const msg = message.body.toLowerCase();

    // Media = comprobante
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const valido = Math.random() > 0.2;
        const nombreArchivo = `comprobante-${Date.now()}.jpg`;
        fs.writeFileSync(`./comprobantes/${nombreArchivo}`, media.data, 'base64');

        return message.reply(valido ?
            "✅ Comprobante recibido. Estamos verificando... recibirás tu cuenta en breve. 🙌" :
            "❌ El comprobante parece inválido. Por favor verifica que los datos sean correctos.");
    }

    // Insultos
    const palabrasOfensivas = ["hp", "gonorrea", "malparido", "imbécil"];
    if (palabrasOfensivas.some(p => msg.includes(p))) {
        return message.reply(respuestas.insultos[Math.floor(Math.random() * respuestas.insultos.length)]);
    }

    // Saludos y despedidas
    if (["hola", "buenas", "hey", "saludos"].some(p => msg.includes(p))) {
        return message.reply(respuestas.saludos[Math.floor(Math.random() * respuestas.saludos.length)]);
    }
    if (["gracias", "chao", "bye", "adiós"].some(p => msg.includes(p))) {
        return message.reply(respuestas.despedidas[Math.floor(Math.random() * respuestas.despedidas.length)]);
    }

    // Preguntas frecuentes
    for (const clave in respuestas.preguntasFrecuentes) {
        if (msg.includes(clave)) {
            return message.reply(respuestas.preguntasFrecuentes[clave]);
        }
    }

    // Productos
    for (const clave in productos) {
        if (msg.includes(clave)) {
            return message.reply(productos[clave]);
        }
    }

    // Palabras clave para combos
    if (msg.includes("combo")) {
        return message.reply(respuestas.preguntasFrecuentes["combo"]);
    }

    // Último recurso: respuesta genérica
    return message.reply(respuestas.respuestaGenerica[Math.floor(Math.random() * respuestas.respuestaGenerica.length)]);
});

// Express
app.get('/', (req, res) => {
    res.send('🤖 Bot de WhatsApp activo. Escanea el QR desde la consola.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Servidor web activo en http://localhost:${PORT}`);
});

client.initialize();
