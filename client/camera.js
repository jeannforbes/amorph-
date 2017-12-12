class Camera{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data;
        this.id;

        this.loc = new Vector(0,0);
    }

    render(){
        window.requestAnimationFrame(this.render.bind(this));

        this.clear(this.ctx);
        if(!this.data) return;
        this.drawBackground(this.ctx,this.data.world);
        this.drawPlayers(this.ctx, this.data.players);
        this.drawEnemies(this.ctx, this.data.enemies);
    }

    clear(ctx){
        ctx.save();
        ctx.fillStyle = '#444';
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        ctx.restore();
    }

    drawPlayers(ctx, players){
        let keys = Object.keys(players);
        for(let i=0; i<keys.length; i++){
            let p = players[keys[i]];
            this.drawPlayer(ctx, p);
        }
    }

    drawEnemies(ctx, enemies){
        let keys = Object.keys(enemies);
        for(let i=0; i<keys.length; i++){
            let p = enemies[keys[i]];
            this.drawEnemy(ctx, p);
        }
    }

    drawPlayer(ctx, p){
        if(p.id === this.id) 
            this.centerOn(new Vector(p.pbody.loc.x, p.pbody.loc.y));
        let pos = this.worldToCamera(new Vector(p.pbody.loc.x, p.pbody.loc.y));
        ctx.save();
        if(p.attackCooldown > 0) ctx.fillStyle = 'blue';
        else ctx.fillStyle = 'rgba(0,255,0,'+p.health/5+')';
        ctx.strokeStyle = '#000';
        ctx.translate(pos.x,pos.y);
        // Draw body
        ctx.beginPath();
        ctx.arc(0,0,p.pbody.mass,0,2*Math.PI);
        ctx.fill();
        // Draw sword
        let forward = new Vector(p.pbody.vel.x, p.pbody.vel.y).normalize();
        forward.x *= p.attackRange;
        forward.y *= p.attackRange;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(forward.x, forward.y);
        ctx.stroke();
        // Write name & score
        ctx.save();
        ctx.font = '16px Roboto';
        ctx.fillStyle = 'black';
        ctx.fillText(p.name, p.pbody.mass+2,p.pbody.mass-10);
        ctx.fillText(p.score, p.pbody.mass,p.pbody.mass+10);
        ctx.restore();
        ctx.restore();
    }

    drawEnemy(ctx, p){
        let pos = this.worldToCamera(new Vector(p.pbody.loc.x, p.pbody.loc.y));
        ctx.save();
        if(p.isVulnerable) ctx.fillStyle = 'red';
        else if(p.isClutter) ctx.fillStyle = 'purple';
        else if(p.isBiter) ctx.fillStyle = 'blue';
        else ctx.fillStyle = 'green';
        ctx.translate(pos.x,pos.y);
        ctx.beginPath();
        ctx.arc(0,0,p.pbody.mass,0,2*Math.PI);
        ctx.fill();
        ctx.restore();
    }

    drawBackground(ctx, world){
        let origin = this.worldToCamera(new Vector(world.origin.x, world.origin.y));

        ctx.save();

        // Base color
        ctx.fillStyle = '#9AF';
        ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        // Gradient
        let grd = ctx.createRadialGradient(
            origin.x, origin.y, 
            75, 
            origin.x, origin.y, 
            world.radius);
        grd.addColorStop(0, '#8AF');
        grd.addColorStop(0.5, '#48A');
        grd.addColorStop(1, '#000');
        ctx.fillStyle = grd;
        ctx.globalAlpha = 1;

        ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        ctx.restore();
    }

    centerOn(fLoc){
        //console.log(fLoc);
        if(fLoc) this.loc = new Vector(fLoc.x - this.canvas.width/2, fLoc.y - this.canvas.height/2);
    };

    worldToCamera(v){
        return v.clone().subtract(this.loc);
    }

    cameraToWorld(v){
        return v.clone().add(this.loc);
    }

}

class Vector{
    constructor(x,y){
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v){
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v){
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    distance(v){
        return Math.sqrt(Math.pow(this.x-v.x,2) + (this.y-v.y,2));
    }

    magnitude(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    normalize(){
        let m = this.magnitude();
        if(m != 0){
            this.x /= m;
            this.y /= m;
        }
        return this;
    }

    clone(){
        return new Vector(this.x, this.y);
    }

}