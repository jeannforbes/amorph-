const Victor = require('victor');
const PBody = require('./pbody.js');

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name || 'anonymous+';
    this.pbody = new PBody();
    this.pbody.mass = 20;

    this.maxSpeed = 10;
    this.speed = 20;

    this.attackRange = 100;
    this.attackCooldown = 0;
    this.attackParalysisTime = 10;

    this.invulCooldown = 0;

    this.health = 5;
    this.score = 0;
  }

  update() {
    // if (this.health <= 0) return;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.invulCooldown > 0) this.invulCooldown--;

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
      return;
    }
    this.pbody.move(this.maxSpeed);
  }

  attack() {
    this.attackCooldown = this.attackParalysisTime;
  }

  dash() {
    this.maxSpeed *= 2;
  }

  takeDamage() {
    if (this.invulCooldown > 0) return;
    this.health--;
    this.invulCooldown = 10;
  }

  moveToMouse(data) {
    // Camera coords in world space
    const cameraLoc = new Victor(
      this.pbody.loc.x + (data.w / 2),
      this.pbody.loc.y + (data.h / 2));
    // Mouse coords in world space
    const mouseLoc = cameraLoc.clone().subtract(new Victor(data.x, data.y));
    // Vector from player to mouse
    const playerToMouse = this.pbody.loc.clone().subtract(mouseLoc);

    // If the mouse is close enough to the player, hold still
    if (playerToMouse.magnitude() < 20) {
      this.pbody.vel.x = 0;
      this.pbody.vel.y = 0;
      return;
    }

    // Vector from player to mouse
    const force = playerToMouse.normalize();
    force.x *= this.speed;
    force.y *= this.speed;
    this.pbody.applyForce(force);
  }
}

module.exports = Player;
