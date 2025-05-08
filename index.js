const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const app = express();

// Configuración del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

// Base de datos de respuestas extendidas
const respuestas = {
    saludos: [
        "👋 ¡Hola! Bienvenido/a a nuestro servicio de cuentas premium. Soy tu asistente virtual y estoy aquí para ayudarte a conseguir la mejor experiencia de streaming. ¿En qué puedo ayudarte hoy? Puedes preguntar por nuestros precios, servicios disponibles, o formas de pago. ¡Estoy aquí para servirte! 😊",
        
        "¡Buenas! Gracias por contactarnos. Somos especialistas en proporcionar acceso a tus plataformas de streaming favoritas a precios increíbles. ¿Qué cuenta estás buscando hoy? Tenemos Netflix, Disney+, HBO Max, Amazon Prime, Spotify y muchas más. ¡Solo pregunta! 🎬🍿",
        
        "Hey! 👋 ¡Qué alegría tenerte aquí! Somos tu solución para acceder a todas las plataformas de streaming a precios super accesibles. ¿Qué cuenta deseas comprar? Estamos para ayudarte con cualquier duda que tengas sobre nuestros servicios, garantías o métodos de pago. ¡Cuéntame! 💫"
    ],
    
    despedidas: [
        "Hasta luego 👋 Ha sido un placer atenderte. Recuerda que estamos disponibles 24/7 para cualquier consulta adicional. Si necesitas ayuda con tu cuenta o tienes alguna duda, no dudes en escribirnos nuevamente. ¡Que disfrutes de tu experiencia premium! ✨",
        
        "Nos vemos, gracias por tu mensaje 😊 Apreciamos mucho tu confianza en nuestro servicio. Estaremos aquí cuando necesites renovar tu cuenta o adquirir alguna otra plataforma. ¡Disfruta de tus series y películas favoritas! 🎬",
        
        "Que tengas un excelente día ✌️ Gracias por preferir nuestro servicio. Esperamos que disfrutes al máximo tu nueva cuenta premium. Recuerda que estamos a tu disposición para cualquier consulta o asistencia técnica que necesites. ¡Hasta pronto! 🌟"
    ],
    
    insultos: [
        "😅 Entiendo que puedas sentirte frustrado, pero estoy aquí para ayudarte de la mejor manera posible. Cuéntame específicamente qué necesitas y buscaremos una solución juntos. Nuestro objetivo es brindarte el mejor servicio. ¿En qué puedo asistirte hoy?",
        
        "Comprendo que a veces la comunicación por chat puede ser complicada. Permíteme ayudarte de forma profesional. ¿Podrías explicarme qué servicio estás buscando o qué problema tienes? Estoy aquí para encontrar la mejor solución para ti. 🤝",
        
        "🤖 Como asistente virtual, mi único propósito es brindarte la mejor atención posible. Cuéntame qué necesitas específicamente y te ayudaré con gusto. Tenemos excelentes ofertas en cuentas de streaming que podrían interesarte. ¿Te gustaría conocerlas? 😉"
    ],
    
    preguntasFrecuentes: {
        "precio": "💵 *NUESTROS PRECIOS ACTUALIZADOS:*\n\n• Netflix Premium: $10.000 (Plan 4K, 4 pantallas)\n• Disney+ Premium: $6.500 (Todas las películas y series)\n• HBO Max Premium: $6.500 (Contenido completo)\n• Crunchyroll Premium: $5.000 (Anime sin anuncios)\n• Amazon Prime: $5.000 (Incluye Prime Video y envíos gratis)\n• Spotify Premium: $8.500 (Música sin publicidad)\n\n*OFERTA ESPECIAL:* Combo Netflix + Disney+ por solo $16.000 (¡ahorras $500!)\n\nTodos nuestros precios incluyen garantía de funcionamiento. ¿Cuál te interesa adquirir? 🎬✨",
        
        "formas de pago": "💳 *MÉTODOS DE PAGO ACEPTADOS:*\n\n• Nequi: Transfiere al número 3108336538 (a nombre de Carlos Mendoza)\n• Transfiya: Envía al mismo número 3108336538\n• Bancolombia: También aceptamos transferencias bancarias (solicita los datos)\n\nUna vez realizado el pago, por favor envía el comprobante o captura de pantalla por este mismo chat. Verificaremos tu pago y en menos de 10 minutos recibirás los datos de tu cuenta. ¡Así de rápido y sencillo! 🚀\n\n¿Necesitas ayuda con el proceso de pago? ¡Estoy aquí para asistirte!",
        
        "disponible": "✅ *¡SÍ TENEMOS DISPONIBILIDAD!*\n\nActualmente contamos con cuentas disponibles en todas nuestras plataformas:\n\n• Netflix ✓\n• Disney+ ✓\n• HBO Max ✓\n• Amazon Prime ✓\n• Spotify ✓\n• Crunchyroll ✓\n• Star+ ✓\n• Paramount+ ✓\n\nTodas son cuentas premium con acceso total al catálogo. ¿Cuál deseas adquirir hoy? También tenemos combos especiales que te pueden interesar. ¡Pregúntame por ellos y ahorra! 🎁",
        
        "cuánto demora": "⌛ *TIEMPO DE ENTREGA GARANTIZADO*\n\nNuestro proceso es super rápido:\n\n1. Realizas el pago ✓\n2. Envías el comprobante ✓\n3. Verificamos la transacción (1-2 minutos) ✓\n4. Recibes los datos de tu cuenta (correo y contraseña) ✓\n\nEn total, en menos de 10 minutos después de enviar tu comprobante recibirás tu cuenta lista para usar. Trabajamos 24/7, así que no importa la hora, ¡siempre te atenderemos con la misma rapidez! ⚡\n\n¿Listo para disfrutar de tu contenido favorito?",
        
        "garantía": "🔒 *NUESTRA GARANTÍA DE SERVICIO*\n\nTodas nuestras cuentas incluyen garantía de funcionamiento:\n\n• Si la cuenta presenta problemas de acceso, te la reemplazamos sin costo adicional\n• Soporte técnico personalizado durante la vigencia de tu cuenta\n• Respuesta a problemas en menos de 24 horas\n• Tutoriales de uso y configuración si los necesitas\n\nLa duración de la garantía depende del servicio contratado (generalmente entre 1-3 meses). Si tienes cualquier inconveniente, solo escríbenos a este mismo número y solucionaremos tu problema de inmediato. ¡Tu satisfacción es nuestra prioridad! 🛡️",
        
        "combo": "🎁 *COMBOS ESPECIALES - AHORRA EN GRANDE*\n\n• 🔥 COMBO BÁSICO: Netflix + Disney+ por solo $16.000 (ahorras $500)\n• 🔥 COMBO CINE: Netflix + HBO Max por $15.500 (ahorras $1.000)\n• 🔥 COMBO COMPLETO: Netflix + Disney+ + HBO Max por solo $21.000 (ahorras $2.000)\n• 🔥 COMBO FAMILIAR: Netflix + Disney+ + Amazon Prime por $20.000 (ahorras $1.500)\n• 🔥 COMBO TOTAL: Todas las plataformas por $35.000 (¡ahorro de $6.500!)\n\nTodos los combos incluyen las mismas garantías que nuestras cuentas individuales. ¿Cuál te interesa? 💳 Aceptamos Nequi y Transfiya al 3108336538.",
        
        "duración": "⏱️ *DURACIÓN DE NUESTRAS CUENTAS*\n\nTodas nuestras cuentas tienen una duración mínima garantizada de 1 mes. Muchos clientes disfrutan sus cuentas por periodos más largos (hasta 3-6 meses). \n\nAl terminar el periodo, puedes renovar con un 10% de descuento como cliente frecuente. Te avisaremos cuando esté próxima a vencer para que no pierdas acceso a tu contenido favorito.\n\n¿Te gustaría adquirir alguna cuenta hoy o tienes alguna otra pregunta sobre la duración? 📆",
        
        "legal": "⚖️ *SOBRE NUESTRO SERVICIO*\n\nNuestro servicio consiste en proporcionar acceso a cuentas de streaming optimizadas para uso compartido, permitiéndote disfrutar de contenido premium a precios accesibles.\n\nEstas cuentas están configuradas específicamente para uso compartido y son administradas de manera que todos los usuarios puedan disfrutar del servicio sin inconvenientes.\n\n¿Tienes alguna otra pregunta sobre cómo funciona nuestro servicio? Estoy aquí para ayudarte. 📱",
        
        "compartida": "👥 *SOBRE CUENTAS COMPARTIDAS*\n\nNuestras cuentas están configuradas para uso compartido óptimo:\n\n• Cada usuario tiene su propio perfil\n• Puedes crear/personalizar tu perfil como desees\n• No hay interferencia entre usuarios\n• Las recomendaciones se mantienen personalizadas\n• Soporte técnico en caso de cualquier inconveniente\n\nMuchos de nuestros clientes llevan meses disfrutando sin problemas. ¿Te gustaría probar este servicio? Es 100% funcional y mucho más económico que una suscripción regular. 💯",
        
        "premium": "🌟 *CARACTERÍSTICAS PREMIUM*\n\nTodas nuestras cuentas incluyen acceso a planes premium:\n\n• Netflix: Plan 4K con 4 pantallas simultáneas\n• Disney+: Catálogo completo en alta definición\n• HBO Max: Acceso a estrenos simultáneos con cines\n• Spotify: Sin anuncios, descarga offline y alta calidad\n• Amazon Prime: Prime Video + beneficios de envío\n\nNo ofrecemos planes básicos o con limitaciones. ¿Te gustaría disfrutar de la experiencia premium completa a un precio increíble? 🎯"
    },
    
    productos: {
        netflix: "📺 *NETFLIX PREMIUM* 🔴\n\n*Precio:* $10.000 pesos\n*Duración:* 30 días garantizados (suele durar más)\n*Calidad:* 4K Ultra HD + HDR\n*Pantallas:* 4 simultáneas\n*Perfiles:* Hasta 5 perfiles personalizables\n*Contenido:* Acceso a todo el catálogo de Netflix\n*Dispositivos:* Smart TV, celulares, tablets, computadoras\n\n*Beneficios:*\n• Crea tu propio perfil personalizado\n• Agrega a tu lista de favoritos\n• Recibe recomendaciones personalizadas\n• Descarga contenido para ver offline\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Te gustaría adquirir esta cuenta? 🍿",
        
        disney: "📺 *DISNEY+ PREMIUM* 🔵\n\n*Precio:* $6.500 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Full HD / 4K (según contenido)\n*Pantallas:* 4 dispositivos simultáneos\n*Perfiles:* Hasta 7 perfiles personalizables\n*Contenido:* Disney, Pixar, Marvel, Star Wars, National Geographic\n\n*Beneficios:*\n• Contenido exclusivo de Disney+\n• Estrenos directos de cine\n• Series originales de Marvel y Star Wars\n• Ideal para toda la familia\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Quieres disfrutar del mundo mágico de Disney? 🏰✨",
        
        hbo: "📺 *HBO MAX PREMIUM* ⚫\n\n*Precio:* $6.500 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Full HD / 4K HDR\n*Pantallas:* 3 dispositivos simultáneos\n*Perfiles:* Hasta 5 perfiles personalizables\n*Contenido:* HBO, Warner Bros, DC Comics, Cartoon Network\n\n*Beneficios:*\n• Estrenos de Warner simultáneos con cines\n• Series exclusivas de HBO\n• Universo DC completo\n• Contenido para adultos y niños\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Quieres ver las mejores series del momento? 🦇🎬",
        
        crunchyroll: "📺 *CRUNCHYROLL PREMIUM* 🟠\n\n*Precio:* $5.000 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Full HD\n*Pantallas:* 1 dispositivo a la vez\n*Contenido:* La mayor biblioteca de anime del mundo\n\n*Beneficios:*\n• Sin publicidad\n• Episodios disponibles una hora después de Japón\n• Acceso a manga selecto\n• Descarga para ver offline\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Listo para disfrutar del mejor anime? 🍥🇯🇵",
        
        amazon: "📺 *AMAZON PRIME VIDEO* 🔵\n\n*Precio:* $5.000 pesos\n*Duración:* 30 días garantizados\n*Calidad:* 4K Ultra HD + HDR\n*Pantallas:* 3 dispositivos simultáneos\n*Perfiles:* Hasta 6 perfiles\n*Contenido:* Series originales, películas, documentales\n\n*Beneficios:*\n• Series exclusivas como The Boys, La Rueda del Tiempo\n• Transmisiones deportivas seleccionadas\n• Posibilidad de alquilar estrenos recientes\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Te gustaría explorar el catálogo de Amazon? 📦🎬",
        
        spotify: "🎵 *SPOTIFY PREMIUM* 🟢\n\n*Precio:* $8.500 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Hasta 320kbps\n*Dispositivos:* Uso en móvil, PC, Smart TV y más\n*Plan:* Individual Premium\n\n*Beneficios:*\n• Sin anuncios ni interrupciones\n• Descarga música para escuchar offline\n• Calidad de audio superior\n• Saltos ilimitados\n• Modo conducción\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Listo para disfrutar de tu música favorita sin interrupciones? 🎧🎶",
        
        paramount: "📺 *PARAMOUNT+ PREMIUM* 🔵\n\n*Precio:* $5.500 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Full HD / 4K\n*Pantallas:* 3 dispositivos simultáneos\n*Perfiles:* Hasta 6 perfiles\n*Contenido:* Paramount Pictures, CBS, Comedy Central, MTV, Nickelodeon\n\n*Beneficios:*\n• Películas recién salidas del cine\n• Series exclusivas\n• Contenido infantil de Nickelodeon\n• Reality shows de MTV\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Te interesa explorar este catálogo? 🎬",
        
        star: "📺 *STAR+ PREMIUM* 🔴\n\n*Precio:* $6.000 pesos\n*Duración:* 30 días garantizados\n*Calidad:* Full HD / 4K\n*Pantallas:* 4 dispositivos simultáneos\n*Perfiles:* Hasta 7 perfiles\n*Contenido:* Series de Fox, FX, ESPN deportes en vivo\n\n*Beneficios:*\n• Contenido exclusivo para adultos\n• Deportes en vivo (ESPN)\n• Series completas (Los Simpson, Family Guy)\n• Películas de 20th Century Studios\n\n💳 Aceptamos Nequi y Transfiya al 3108336538\n\n¿Fan de los deportes o series como Los Simpson? Esta es tu cuenta ideal! ⚽🎬"
    },
    
    respuestaGenerica: [
        "🤔 No he comprendido completamente tu consulta. ¿Podrías por favor ser más específico/a sobre qué servicio estás interesado/a? Tenemos Netflix, Disney+, HBO Max, Spotify y muchos más. También puedes preguntar por nuestros métodos de pago, garantías o combos especiales.",
        
        "Parece que estás interesado/a en nuestros servicios de streaming. Para ayudarte mejor, ¿podrías indicarme específicamente qué plataforma te interesa? Tenemos cuentas de Netflix desde $10.000, Disney+ desde $6.500, y muchas más opciones. ¿O prefieres conocer nuestros combos con descuento?",
        
        "Estoy aquí para asistirte con todo lo relacionado a cuentas premium de streaming. Si buscas una experiencia de entretenimiento completa a precios increíbles, has llegado al lugar correcto. Puedes preguntarme por Netflix, Disney+, HBO, Spotify o cualquiera de nuestros servicios. También puedo informarte sobre métodos de pago o nuestras garantías. ¿En qué te puedo ayudar específicamente?"
    ],
    
    promociones: [
        "🔥 *¡PROMOCIÓN ESPECIAL DE LA SEMANA!* 🔥\n\nPor tiempo limitado: Adquiere cualquier combo y recibe 1 semana EXTRA de servicio totalmente GRATIS.\n\nCombos disponibles:\n• Netflix + Disney+ por $16.000\n• Netflix + HBO Max por $15.500\n• Combo Total (todas las plataformas) por $35.000\n\n¡No dejes pasar esta oportunidad! Oferta válida hasta agotar existencias. 🎁",
        
        "⚡ *¡FLASH SALE!* ⚡\n\nSolo por 24 horas: Todas nuestras cuentas individuales con 15% de DESCUENTO.\n\nPrecios especiales:\n• Netflix: $8.500 (antes $10.000)\n• Disney+: $5.500 (antes $6.500)\n• Spotify: $7.200 (antes $8.500)\n\n¡Aprovecha YA! Promoción por tiempo muy limitado. 🕒",
        
        "🎁 *¡CLIENTE NUEVO = REGALO ESPECIAL!* 🎁\n\nPor ser tu primera compra con nosotros, recibirás GRATIS un mes de Amazon Prime Video con la compra de cualquier cuenta de Netflix o Disney+.\n\n¡Tu entretenimiento completo por el precio de una sola cuenta! Menciona este mensaje al realizar tu compra para reclamar tu regalo. 🎉"
    ]
};

// Base de datos más completa de productos
const productos = {
    netflix: { nombre: "Netflix", precio: "10.000", duracion: "30 días", calidad: "4K Ultra HD", pantallas: "4" },
    disney: { nombre: "Disney+", precio: "6.500", duracion: "30 días", calidad: "Full HD/4K", pantallas: "4" },
    hbo: { nombre: "HBO Max", precio: "6.500", duracion: "30 días", calidad: "Full HD/4K", pantallas: "3" },
    crunchyroll: { nombre: "Crunchyroll", precio: "5.000", duracion: "30 días", calidad: "Full HD", pantallas: "1" },
    amazon: { nombre: "Amazon Prime", precio: "5.000", duracion: "30 días", calidad: "4K Ultra HD", pantallas: "3" },
    spotify: { nombre: "Spotify", precio: "8.500", duracion: "30 días", calidad: "320kbps", dispositivos: "Múltiples" },
    paramount: { nombre: "Paramount+", precio: "5.500", duracion: "30 días", calidad: "Full HD/4K", pantallas: "3" },
    star: { nombre: "Star+", precio: "6.000", duracion: "30 días", calidad: "Full HD/4K", pantallas: "4" },
    youtube: { nombre: "YouTube Premium", precio: "7.500", duracion: "30 días", calidad: "4K", dispositivos: "Múltiples" },
    apple: { nombre: "Apple TV+", precio: "5.500", duracion: "30 días", calidad: "4K HDR", pantallas: "6" }
};

// Combos disponibles
const combos = {
    basico: { 
        nombre: "Combo Básico", 
        contenido: "Netflix + Disney+", 
        precio: "16.000", 
        ahorro: "500" 
    },
    cine: { 
        nombre: "Combo Cine", 
        contenido: "Netflix + HBO Max", 
        precio: "15.500", 
        ahorro: "1.000" 
    },
    completo: { 
        nombre: "Combo Completo", 
        contenido: "Netflix + Disney+ + HBO Max", 
        precio: "21.000", 
        ahorro: "2.000" 
    },
    familiar: { 
        nombre: "Combo Familiar", 
        contenido: "Netflix + Disney+ + Amazon Prime", 
        precio: "20.000", 
        ahorro: "1.500" 
    },
    total: { 
        nombre: "Combo Total", 
        contenido: "Todas las plataformas", 
        precio: "35.000", 
        ahorro: "6.500" 
    }
};

// Sistema avanzado de verificación de comprobantes
const comprobantesVerificacion = {
    // Registro de transacciones verificadas
    transaccionesVerificadas: new Set(),
    
    // Patrones sospechosos en comprobantes
    patronesSospechosos: [
        "editado", "modificado", "photoshop", "falso",
        // Añade más patrones según sea necesario
    ],
    
    // Verificar si un comprobante parece legítimo
    verificarComprobante: function(datos, mediaType) {
        // ID único de transacción (puede ser timestamp + algún hash)
        const idTransaccion = datos.idTransaccion || `trans-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Si ya verificamos esta transacción, es sospechoso
        if (this.transaccionesVerificadas.has(idTransaccion)) {
            return {
                esValido: false,
                razon: "Esta transacción ya ha sido registrada anteriormente."
            };
        }
        
        // Verificación básica de fecha (que no sea futura o muy antigua)
        const fechaActual = new Date();
        const fechaComprobante = datos.fecha || fechaActual;
        const diferenciaEnDias = Math.abs((fechaActual - fechaComprobante) / (1000 * 60 * 60 * 24));
        
        if (diferenciaEnDias > 2) {
            return {
                esValido: false,
                razon: "La fecha del comprobante no es reciente (más de 48 horas)."
            };
        }
        
        // Verificar monto mínimo aceptable (ajustar según tus productos más baratos)
        if (datos.monto && datos.monto < 5000) {
            return {
                esValido: false,
                razon: "El monto de la transacción es inferior al mínimo aceptable."
            };
        }
        
        // Verificar tipo de archivo (debe ser imagen)
        if (mediaType && !mediaType.includes('image')) {
            return {
                esValido: false,
                razon: "El comprobante debe ser una imagen clara de la transacción."
            };
        }
        
        // Si pasa todas las verificaciones
        this.transaccionesVerificadas.add(idTransaccion);
        
        return {
            esValido: true,
            idTransaccion: idTransaccion
        };
    }
};

// Crear carpetas necesarias
if (!fs.existsSync('./comprobantes')) {
    fs.mkdirSync('./comprobantes');
}

if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
}

// Sistema de registro de actividad
const logger = {
    registrarActividad: function(tipo, mensaje, datos = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            tipo,
            mensaje,
            ...datos
        };
        
        // Crear archivo de log diario
        const hoy = new Date().toISOString().split('T')[0];
        const logPath = path.join('./logs', `log-${hoy}.json`);
        
        // Leer logs existentes o crear nuevo archivo
        let logs = [];
        if (fs.existsSync(logPath)) {
            try {
                const logContent = fs.readFileSync(logPath, 'utf8');
                logs = JSON.parse(logContent);
            } catch (error) {
                console.error('Error al leer archivo de logs:', error);
            }
        }
        
        // Añadir nueva entrada y guardar
        logs.push(logEntry);
        try {
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Error al escribir en archivo de logs:', error);
        }
        
        // También mostrar en consola
        console.log(`[${timestamp}] [${tipo}] ${mensaje}`);
    }
};

// Base de conocimientos para responder preguntas generales
const baseConocimientos = {
    // Preguntas sobre el servicio
    "¿cómo funciona?": "Nuestro servicio es muy sencillo:\n\n1. Eliges la cuenta que deseas\n2. Realizas el pago por Nequi o Transfiya\n3. Envías el comprobante\n4. Recibes los datos de tu cuenta en minutos\n\nA partir de ese momento podrás disfrutar de todo el contenido en la plataforma elegida. ¡Así de simple!",
    
    "perfil propio": "¡Absolutamente! Podrás crear tu propio perfil personalizado en la cuenta. Esto te permite tener tus propias recomendaciones, tu lista de series y películas por ver, y una experiencia totalmente personalizada. Nadie podrá ver tu historial de visualización ni afectar tus recomendaciones.",
    
    "problemas técnicos": "Si experimentas cualquier problema técnico con tu cuenta:\n\n1. Escríbenos detallando el problema\n2. Verificaremos la situación inmediatamente\n3. Solucionaremos el problema o te proporcionaremos una cuenta nueva\n\nNuestro soporte técnico está disponible 24/7 para ayudarte.",
    
    "renovación": "Para renovar tu cuenta cuando esté por vencer:\n\n1. Escríbenos mencionando que quieres renovar\n2. Te confirmaremos disponibilidad y precio (con 10% de descuento por ser cliente frecuente)\n3. Realizas el pago y listo\n\nTambién podemos avisarte unos días antes de que venza tu cuenta para que no pierdas acceso.",
    
    // Preguntas específicas sobre plataformas
    "contenido netflix": "Netflix ofrece miles de series, películas, documentales y contenido original exclusivo. Incluye populares series como Stranger Things, La Casa de Papel, Bridgerton, Squid Game, y películas de todos los géneros. Se agregan nuevos títulos cada semana y puedes acceder al catálogo completo sin restricciones.",
    
    "contenido disney": "Disney+ incluye todo el universo Disney, Pixar, Marvel, Star Wars y National Geographic. Podrás disfrutar de clásicos de Disney, todas las películas del UCM, series como The Mandalorian, WandaVision, y exclusivos como Loki. Perfecto para toda la familia.",
    
    "limitaciones": "Nuestras cuentas no tienen limitaciones en cuanto a contenido o funcionalidad. Accedes exactamente a lo mismo que alguien con una suscripción directa, incluyendo todas las funciones premium como descargas offline, perfiles personalizados y máxima calidad de video disponible.",
    
    // Preguntas técnicas
    "dispositivos compatibles": "Nuestras cuentas funcionan en cualquier dispositivo compatible con la plataforma:\n• Smart TVs (Samsung, LG, Sony, etc.)\n• Smartphones y tablets (Android e iOS)\n• Computadoras (Windows, Mac)\n• Consolas de videojuegos (PlayStation, Xbox)\n• Dispositivos de streaming (Chromecast, Roku, Fire TV)\n\nLa experiencia es idéntica a una cuenta regular.",
    
    "cambiar contraseña": "No se recomienda cambiar la contraseña de la cuenta ya que es compartida. Sin embargo, puedes crear tu perfil personal y personalizarlo completamente. Si tienes alguna preocupación específica sobre seguridad, házmelo saber y buscaremos la mejor solución.",
    
    "calidad video": "Todas nuestras cuentas ofrecen la máxima calidad de video disponible en cada plataforma:\n• Netflix: 4K Ultra HD + HDR cuando esté disponible\n• Disney+: Hasta 4K con Dolby Vision y Dolby Atmos\n• HBO Max: 4K HDR en contenido seleccionado\n• Amazon Prime: 4K Ultra HD + HDR\n• Spotify: Calidad de audio hasta 320kbps\n\nNuestras cuentas nunca están limitadas en calidad."
