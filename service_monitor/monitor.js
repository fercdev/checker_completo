require('dotenv').config();

const redis = require('redis');
const io = require('socket.io')(4000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true
    }
});
const cors = require('cors');
const REDIS_HOST = process.env.REDIS_HOST;
const BACKEND_INICIAL_HOST = process.env.BACKEND_INICIAL_HOST;
const clientRedis = redis.createClient({url: `redis://${REDIS_HOST}:6379`});
const axios = require('axios');
clientRedis.connect();

io.on('connection', (socket) => {
    console.log('A client connected');
})

// redis, axios, socketio, dotenv
const checkBackendInicial = async () => {
    try {
        await axios.get(`http://${BACKEND_INICIAL_HOST}:3000`);
        clientRedis.set('service_status', 'saludable')
    } catch (err) {
        clientRedis.set('service_status', 'no_saludable')
        console.log('Invocacion al servicion backen errado: ',err);
    }
}

setInterval(async () => {
    const status = await clientRedis.get('service_status');
    io.emit('status_updated', {service: 'backend_inicial', status});
    console.log(`Evento emitido: ${status}`)
}, 5000)

setInterval(checkBackendInicial, 10000)