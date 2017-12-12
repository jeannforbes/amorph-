const Victor = require('victor');

const Player = require('./player.js');
const Enemy = require('./enemy.js');

const getRandomFromDict = (dict) => {
  const keys = Object.keys(dict);
  return dict[keys[parseInt(Math.random() * keys.length, 10)]];
};

const loop = (dict, func) => {
  const keys = Object.keys(dict);
  for (let i = 0; i < keys.length; i++) {
    func(dict[keys[i]]);
  }
};

class Game {
  constructor(io) {
    this.io = io;

    this.radius = 500;
    this.origin = new Victor(0, 0);

    this.players = {};
    this.enemies = {};

    this.updater = null;
    this.broadcaster = null;

    this.tickSpeed = 50;
  }

  start() {
    this.io.on('connection', (socket) => {
      console.log(`${socket.id} connected`);

      this.players[socket.id] = new Player(socket.id);

      socket.emit('joined', {});
      socket.on('disconnect', () => {
        delete this.players[socket.id];
      });
      socket.on('mouseMove', (data) => {
        this.players[socket.id].moveToMouse(data);
      });
      socket.on('mouseClick', () => {
        // Check for collisions against enemies
        //   in front of & certain distance from player
      });
      socket.on('rightClick', () => {
        // this.players[socket.id].dash();
      });

      this.spawnEnemy();
      this.spawnEnemy();
      this.spawnEnemy();
    });

    if (!this.updater) {
      this.updater = setInterval(() => {
        this.update(this.io);
      }, this.tickSpeed);
    }
  }

  update(io) {
    // Update entities
    loop(this.players, (p) => { p.update(); });
    loop(this.enemies, (e) => { e.update(); });

    // Prevent players from going out of bounds
    loop(this.players, (p) => {
      if (this.origin.distance(p.pbody.loc) > this.radius) {
        // Add a force going towards the origin
        const force = this.origin.clone().subtract(p.pbody.loc).normalize();
        force.x *= 100;
        force.y *= 100;
        p.pbody.applyForce(force);
      }
    });

    // Check collisions between players and enemies
    loop(this.players, (p) => {
      loop(this.enemies, (e) => {
        if (p.pbody.isColliding(e.pbody)) {
          p.takeDamage();
        }
      });
    });

    io.emit('update', {
      world: {
        radius: this.radius,
        origin: this.origin,
      },
      players: this.players,
      enemies: this.enemies,
    });
  }

  spawnEnemy() {
    this.enemies[Date.now()] = new Enemy(
      Math.random() * 100,
      Math.random() * 100,
      getRandomFromDict(this.players));
  }
}

module.exports = Game;
