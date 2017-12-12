const Victor = require('victor');

class PBody {
  constructor(loc, vel, accel, mass) {
    this.loc = loc || new Victor(0, 0);
    this.vel = vel || new Victor(0, 0);
    this.accel = accel || new Victor(0, 0);

    this.mass = mass || 10;
    this.density = 1;
  }

  get size() { return this.mass * this.density; }
  get forward() { return this.vel.clone().normalize(); }

  // F = m * a
  applyForce(force) {
    const f = force.clone();
    f.x /= this.mass * 0.25;
    f.y /= this.mass * 0.25;
    this.accel.add(f);
  }

  move(limit) {
    if (this.mass < 0) this.mass = 0.1;

    this.vel.add(this.accel);

    // Limit velocity
    if (this.vel.magnitude() > limit) {
      this.vel.normalize();
      this.vel.x *= limit;
      this.vel.y *= limit;
    }

    this.loc.add(this.vel);

    this.accel.x = 0;
    this.accel.y = 0;
  }

  collide(b) {
    const aToB = b.loc.clone().subtract(this.loc);
    const dist = aToB.magnitude();
    aToB.normalize();
    aToB.x *= -((this.size + b.size) - dist) * 10;
    aToB.y *= -((this.size + b.size) - dist) * 10;
    this.applyForce(aToB);
  }

  isColliding(pb) {
    const dist = this.loc.distance(pb.loc);
    if (dist < this.size + pb.size) return true;
    return false;
  }

  isBehind(pb) {
    if (!this.isFacing(pb, 20)) return false;

    // Distance from your front to their loc
    const distA = this.forward.distance(pb.loc);

    // Distance from their front to your loc
    const distB = pb.forward.distance(this.loc);

    if (distA > distB) return true;
    return false;
  }

  isFacing(pb, tolerance) {
    const angle = this.loc.dot(pb.loc);
    if (90 - angle < (tolerance || 45)) return true;
    return false;
  }
}

module.exports = PBody;
