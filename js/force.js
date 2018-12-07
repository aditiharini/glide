function Force (accl, position, xRange, yRange) {
    this.accl = accl;
    this.position  = position;
    this.xRange = xRange;
    this.yRange = yRange;
}

Force.prototype.applyTo = function(particle) {
    if (!this.position || this.isInRange(particle)) {
        particle.accl.add(new THREE.Vector3(this.accl.x, this.accl.y, this.accl.z));
    } else {
        particle.accl.add(new THREE.Vector3(0, 0, 0));
    }
}

Force.prototype.isInRange = function(particle) {
    return particle.x < this.position.x + this.xRange && 
           particle.x > this.position.x - this.xRange &&
           particle.y < this.position.y + this.yRange &&
           particle.y > this.position.y - this.yRange;
}