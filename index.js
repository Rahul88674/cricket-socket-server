// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST']
//     }
// });

// // Store latest scores in memory
// let liveScores = {};

// // Socket connection
// io.on('connection', (socket) => {
//     console.log(`⚡ User connected: ${socket.id}`);

//     // Send current scores to newly connected user
//     socket.emit('currentScores', liveScores);

//     // Join a match room
//     socket.on('joinMatch', (matchId) => {
//         socket.join(`match_${matchId}`);
//         console.log(`🏏 User joined match room: match_${matchId}`);

//         // Send current score of this match
//         if (liveScores[matchId]) {
//             socket.emit('scoreUpdated', liveScores[matchId]);
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log(`❌ User disconnected: ${socket.id}`);
//     });
// });

// // API endpoint — Lumen will call this to trigger socket event
// app.post('/trigger-score-update', (req, res) => {
//     const { matchId, scoreData } = req.body;

//     if (!matchId || !scoreData) {
//         return res.status(400).json({ message: 'matchId and scoreData are required' });
//     }

//     // Store in memory
//     liveScores[matchId] = scoreData;

//     // Broadcast to all users in this match room
//     io.to(`match_${matchId}`).emit('scoreUpdated', scoreData);

//     console.log(`📡 Score broadcasted for match ${matchId}:`, scoreData);

//     return res.json({ message: 'Score broadcasted successfully!' });
// });

// // Health check
// app.get('/', (req, res) => {
//     res.json({ message: 'Cricket Socket Server is running! ⚡' });
// });

// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`🚀 Socket server running on http://localhost:${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store latest scores in memory
let liveScores = {};

// Socket connection
io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // Send current scores to newly connected user
    socket.emit('currentScores', liveScores);

    // Join a match room
    socket.on('joinMatch', (matchId) => {
        socket.join(`match_${matchId}`);
        console.log(`🏏 User joined match room: match_${matchId}`);

        // Send current score of this match
        if (liveScores[matchId]) {
            socket.emit('scoreUpdated', liveScores[matchId]);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Score update trigger
app.post('/trigger-score-update', (req, res) => {
    const { matchId, scoreData } = req.body;

    if (!matchId || !scoreData) {
        return res.status(400).json({ message: 'matchId and scoreData are required' });
    }

    liveScores[matchId] = scoreData;
    io.to(`match_${matchId}`).emit('scoreUpdated', scoreData);
    console.log(`📡 Score broadcasted for match ${matchId}:`, scoreData);

    return res.json({ message: 'Score broadcasted successfully!' });
});

// Innings switch trigger
app.post('/trigger-innings-switch', (req, res) => {
    const { matchId, matchData } = req.body;

    if (!matchId || !matchData) {
        return res.status(400).json({ message: 'matchId and matchData are required' });
    }

    io.to(`match_${matchId}`).emit('inningsSwitched', matchData);
    console.log(`🏏 Innings switched for match ${matchId}`);

    return res.json({ message: 'Innings switch broadcasted!' });
});

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Cricket Socket Server is running! ⚡' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Socket server running on http://localhost:${PORT}`);
});