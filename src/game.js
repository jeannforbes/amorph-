const Victor = require('victor');

const Player = require('./player.js');
const Enemy = require('./enemy.js').Enemy;
const Biter = require('./enemy.js').Biter;
const Blob = require('./enemy.js').Blob;
const Clutter = require('./enemy.js').Clutter;

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

const ENEMY = {
  BITER: 'biter',
  BLOB: 'blob',
  CLUTTER: 'clutter',
  DEFAULT: 'enemy',
};

class Room {
  constructor(id, io) {
    this.id = id;
    this.io = io;

    this.radius = 500;
    this.origin = new Victor(0, 0);
    this.spawnCap = 10;
    this.tickSpeed = 50;

    this.players = {};
    this.enemies = {};

    this.updater = setInterval(() => {
      this.update(this.io);
    }, this.tickSpeed);
    this.spawner = setInterval(() => {
      if (Object.keys(this.enemies).length < this.spawnCap) {
        this.spawnEnemy(getRandomFromDict(ENEMY));
      }
    }, 1000);
  }

  update(io) {
    // Update entities
    loop(this.players, (p) => {
      // Die if player loses all their health
      if (p.health <= 0) {
        delete this.players[p.id];
        return;
      }
      // Prevent players from going out of bounds
      if (this.origin.distance(p.pbody.loc) > this.radius) {
        // Add a force going towards the origin
        const force = this.origin.clone().subtract(p.pbody.loc).normalize();
        force.x *= 100;
        force.y *= 100;
        p.pbody.applyForce(force);
      }

      p.update();
    });
    loop(this.enemies, (e) => {
      e.update();

      if (this.origin.distance(e.pbody.loc) > this.radius + 50) {
        if (this.enemies[e.id].health <= 1) delete this.enemies[e.id];
        else this.enemies[e.id].health--;
      }
    });

    loop(this.enemies, (e) => {
      // Check collisions between players and enemies
      loop(this.players, (p) => {
        if (p.pbody.isFacing(e.pbody) &&
           p.pbody.loc.distance(e.pbody.loc) < p.attackRange) {
          e.isVulnerable = true;
        } else e.isVulnerable = false;
        if (p.pbody.isColliding(e.pbody)) {
          p.takeDamage();
        }
      });

      // Check collisions between enemies
      loop(this.enemies, (n) => {
        if (e.id !== n.id && e.pbody.isColliding(n.pbody)) {
          e.pbody.collide(n.pbody);
        }
      });
    });

    io.to(this.id).emit('update', {
      world: {
        radius: this.radius,
        origin: this.origin,
      },
      players: this.players,
      enemies: this.enemies,
    });
  }

  spawnEnemy(type) {
    if (Object.keys(this.players).length <= 0) return;
    const id = Date.now();
    const angle = Math.random() * Math.PI * 2;
    const loc = new Victor(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
    const target = getRandomFromDict(this.players);
    switch (type) {
      case ENEMY.BITER:
        this.enemies[id] = new Biter(id, loc, target);
        break;
      case ENEMY.BLOB:
        this.enemies[id] = new Blob(id, loc, target);
        break;
      case ENEMY.CLUTTER:
        this.enemies[id] = new Clutter(id, loc, target);
        break;
      default:
        this.enemies[id] = new Enemy(id, loc, target);
        break;
    }
    console.log(`spawning ${type} targeting ${target.id}`);
  }
}

class ChatMessage {
  constructor(id, msg) {
    this.id = id;
    this.msg = msg;
    this.date = Date.now();
  }
}

class Game {
  constructor(io) {
    this.io = io;

    this.rooms = {};
  }

  start() {
    this.io.on('connection', (socket) => {
      console.log(`${socket.id} connected`);

      socket.on('chatmsg', (data) => {
        console.log('chatmsg', data);
        if (!data.msg) return;
        // Get their player name if they have one
        const rid = this.findRoomIdByPlayerId(socket.id);
        let pname = 'anonymous+';
        if (rid) pname = this.rooms[rid].players[socket.id].name;
        this.io.emit('chatmsg', new ChatMessage(pname, data.msg));
      });

      socket.on('joinData', (data) => {
        const dataRid = data.room || 'default';
        if (!this.rooms[dataRid]) {
          this.rooms[dataRid] = new Room(dataRid, this.io);
        }
        this.rooms[dataRid].players[socket.id] = new Player(socket.id, data.username);
        socket.join(dataRid);
        socket.emit('joined', {});
      });
      socket.on('disconnect', () => {
        const rid = this.findRoomIdByPlayerId(socket.id);
        if (!rid) return;
        if (rid) delete this.rooms[rid].players[socket.id];
      });
      socket.on('mouseMove', (data) => {
        const rid = this.findRoomIdByPlayerId(socket.id);
        if (!rid) return;
        if (rid) this.rooms[rid].players[socket.id].moveToMouse(data);
      });
      socket.on('mouseClick', () => {
        // Check for collisions against enemies
        //   in front of & max distance from player
        const rid = this.findRoomIdByPlayerId(socket.id);
        if (!rid) return;
        const p = this.rooms[rid].players[socket.id];
        loop(this.rooms[rid].enemies, (e) => {
          if (p.pbody.isFacing(e.pbody) &&
             p.pbody.loc.distance(e.pbody.loc) < p.attackRange) {
            delete this.rooms[rid].enemies[e.id];
            p.score++;
          }
        });
        p.attack();
      });
      socket.on('rightClick', () => {
        // let rid = findRoomIdByPlayerId(socket.id);
        // if(!rid) return;
        // this.rooms[rid].this.players[socket.id].dash();
      });
    });
  }

  findRoomIdByPlayerId(pid) {
    const keys = Object.keys(this.rooms);
    for (let i = 0; i < keys.length; i++) {
      const r = this.rooms[keys[i]];
      if (r.players[pid]) return r.id;
    }
    return false;
  }
}

module.exports = Game;
