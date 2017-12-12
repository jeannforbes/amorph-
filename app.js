const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const Game = require('./src/game.js');

// CONSTANTS
const PORT = process.env.PORT || 3000;

server.listen(PORT);

/* HTML */
app.get('/', (req, res) => { res.sendFile('index.html', { root: './client/' }); });
/* CSS */
app.get('/style.css', (req, res) => { res.sendFile('style.css', { root: './client/' }); });

/* JS */
app.get('/*.js', (req, res) => {
    let uid = req.params.uid;
    let path = req.params[Object.keys(req.params)[0]] ? 
        req.params[Object.keys(req.params)[0]] : '';
    res.sendFile(path+'.js', {root: './client/'}); 
});

let game;

const init = () => {

    game = new Game(io);
    game.start();
}

init();