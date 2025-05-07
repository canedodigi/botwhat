client.on('message', message => {
    const msg = message.body.toLowerCase();

    if (msg.includes('precio') || msg.includes('cuánto cuesta') || msg.includes('cuanto vale')) {
        message.reply(`💸 Precios disponibles:
- Netflix: $10.000
- Disney+: $6.500
- HBO Max: $6.500
- Crunchyroll: $5.000
- Amazon Prime: $5.000
- Spotify: $8.500

🎁 Combo Netflix + Disney+: $16.000

Solo pagos por Nequi y Transfiya al 📱 3108336538
¿Te interesa alguno?`);
    }

    else if (msg.includes('combo')) {
        message.reply(`🎉 Tenemos combo especial:
Netflix + Disney por solo $16.000
✅ Ideal para compartir

💵 Pagos solo por Nequi o Transfiya al 3108336538`);
    }

    else if (msg.includes('formas de pago') || msg.includes('cómo pagar') || msg.includes('nequi') || msg.includes('transfiya')) {
        message.reply(`💳 Solo aceptamos pagos por:
📱 Nequi y Transfiya al número 3108336538
Envíame el comprobante para entregarte tu cuenta ✅`);
    }

    else if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey')) {
        message.reply(`👋 ¡Hola! Bienvenido(a) a tu tienda de streaming favorita.
Escríbeme el nombre de la plataforma que deseas o pregunta por nuestros precios.
Tenemos promociones activas 🎁`);
    }

    else if (msg.includes('soporte') || msg.includes('no sirve') || msg.includes('problema') || msg.includes('error')) {
        message.reply(`⚠️ ¿Tienes algún inconveniente con tu cuenta?
Por favor, dime qué sucede y revisaremos tu caso lo más pronto posible.`);
    }
});
