const Victor = require('victor');
const PBody = require('./pbody.js');

class Player {
  constructor(id) {
    this.id = id;
    this.pbody = new PBody();

    this.maxSpeed = 10;
    this.speed = 20;

    this.attackDist = 5;

    this.health = 1;
  }

  update() {
    if (this.health <= 0) return;
    if (this.dashCooldown > 0) this.dashCooldown--;

    this.pbody.move(this.maxSpeed);
  }

  dash() {
    this.maxSpeed *= 2;
    return false;
  }

  takeDamage() {
    this.health--;
  }

  moveToMouse(data) {
    // Camera coords in world space
    const cameraLoc = new Victor(
      (this.pbody.loc.x + data.w) / 2,
      (this.pbody.loc.y + data.h) / 2);
    // Mouse coords in world space
    const mouseLoc = cameraLoc.clone().subtract(new Victor(data.x, data.y));
    // Vector from player to mouse
    const playerToMouse = this.pbody.loc.clone().subtract(mouseLoc);

    // If the mouse is close enough to the player, hold still
    if (playerToMouse.magnitude() < 10) {
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
