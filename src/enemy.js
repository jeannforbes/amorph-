// const Victor = require('victor');
const PBody = require('./pbody.js');

class Enemy {
  constructor(id, loc, target) {
    this.id = id;
    this.type = 'default';
    this.pbody = new PBody();
    this.pbody.loc = loc.clone();

    this.maxSpeed = 10;
    this.speed = 10;

    this.target = target;
    this.isVulnerable = false;

    this.health = 1;

    this.moveTowardTarget();
  }

  update() {
    this.pbody.move(this.maxSpeed);
  }

  moveTowardTarget() {
    if (!this.target) return;

    const loc = this.target.pbody.loc.clone();
    const vecToLoc = loc.subtract(this.pbody.loc);
    const force = vecToLoc.normalize();
    force.x *= this.speed;
    force.y *= this.speed;
    this.pbody.applyForce(force);
  }
}

class Biter extends Enemy {
  constructor(id, loc, target) {
    super(id, loc, target);
    this.isBiter = true;
    this.speed = 5;
  }
  update() {
    this.moveTowardTarget();
    super.update();
  }
  moveTowardTarget() {
    if (!this.target) return;

    // If the player isn't facing it, go for the kill!
    if (!this.target.pbody.isFacing(this.pbody)) {
      super.moveTowardTarget();
    } else { // Otherwise, roll around the player!
      const loc = this.target.pbody.loc.clone();
      const vecToLoc = loc.subtract(this.pbody.loc);
      const force = vecToLoc.normalize();
      force.x *= this.speed;
      force.y *= this.speed;
      this.pbody.applyForce(force.rotateByDeg(90));
    }
  }
}

class Clutter extends Enemy {
  constructor(id, loc, target) {
    super(id, loc, target);
    this.isClutter = true;
    this.speed = 10;
    this.maxSpeed = 9;
    this.range = 50;
    this.scareDist = 80;
  }
  update() {
    this.moveTowardTarget();
    super.update();
  }
  moveTowardTarget() {
    if (!this.target) return;

    // Back away if the player's too close
    if (this.target.pbody.loc.distance(this.pbody.loc) < this.scareDist) {
      const loc = this.target.pbody.loc.clone();
      const vecToLoc = loc.subtract(this.pbody.loc);
      const force = vecToLoc.normalize();
      force.x *= -this.speed;
      force.y *= -this.speed;
      this.pbody.applyForce(force);
    } else {
      super.moveTowardTarget();
    }
  }
}

class Blob extends Enemy {
  constructor(id, loc, target) {
    super(id, loc, target);
    this.pbody.mass *= 2;
    this.speed = 2;
    this.maxSpeed = 2;
  }
  update() {
    super.moveTowardTarget();
    super.update();
  }
}

module.exports.Enemy = Enemy;
module.exports.Biter = Biter;
module.exports.Blob = Blob;
module.exports.Clutter = Clutter;
