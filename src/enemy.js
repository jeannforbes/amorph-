const Victor = require('victor');
const PBody = require('./pbody.js');

class Enemy {
  constructor(x, y, target) {
    this.type = 'default';
    this.pbody = new PBody();
    this.pbody.loc = new Victor(x, y);

    this.maxSpeed = 4;
    this.speed = 2;

    this.target = target; console.log(target);
  }

  update() {
    this.moveTowardTarget();
    this.pbody.move(this.maxSpeed);
  }

  moveTowardTarget() {
    if (this.target) {
      const loc = this.target.pbody.loc.clone();
      const vecToLoc = loc.subtract(this.pbody.loc);
      const force = vecToLoc.normalize();
      force.x *= this.speed;
      force.y *= this.speed;
      this.pbody.applyForce(force);
    }
  }
}

module.exports = Enemy;
