function Particles(renderer, scene, camera, numParticles) {
    this.renderer = renderer;
    this.scene = scene;
    this.numParticles = numParticles;
    this.camera = camera;
    this.isTransporting = false;
    this.isStart = true;
}

Particles.prototype.getWidth = function() {
    return this.renderer.getSize().width;
}

Particles.prototype.getHeight = function() {
    return this.renderer.getSize().height;
}

Particles.prototype.getPoints = function() {
    return this.particles.geometry.vertices;
}

Particles.prototype.setColor = function() {
  if (this.isStart) { return 0xFF0000}
  else {return  0xFFFFFF}
}

Particles.prototype.createParticles = function(letters, numParticles) {
    var color = this.setColor();
    var geom = new THREE.Geometry(),
        mat = new THREE.ParticleBasicMaterial({
            color: color,
            size: 1
        });
    var particles = new THREE.Points(geom, mat);
    this.particles = particles;
    this.scene.add(particles);
    var points = letters.samplePoints(numParticles);
    for (var i = 0; i < numParticles; i++) {
        var point = new THREE.Vector3(points[i].x, points[i].y, 0)
        point.velocity = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5)
        geom.vertices.push(point);
    }
}

Particles.prototype.moveParticles = function(letters) {
    if (!this.particles) {
        this.createParticles(letters, this.numParticles);
        return this;
    }
    var points = letters.samplePoints(this.numParticles);
    for (var i = 0; i < this.numParticles; i++) {
        this.particles.geometry.vertices[i].x = points[i].x;
        this.particles.geometry.vertices[i].y = points[i].y;
    }
    this.particles.geometry.verticesNeedUpdate = true;
    return this;
}

Particles.prototype.setMappingByMax = function(weights, endPoints) {
    var weights = maxByRow(weights);
    for (var i = 0; i < this.numParticles; i++) {
        var startPoint = this.particles.geometry.vertices[i];
        var endPoint = endPoints[weights[i]];
        startPoint.dest = endPoint;
        startPoint.destWeight = 1;
    }
}

Particles.prototype.setMappingByWeight = function(weights, endPoints) {
    this.transportSets = [];
    for (var i = 0; i < weights[0].length; i++) {
        var newParticles = this.clone();
        var endPoint = endPoints[i];
        for (var j = 0; j < this.numParticles; j++) {
            newParticles.particles.geometry.vertices[j].destWeight = weights[j][i];
            newParticles.particles.geometry.vertices[j].dest = endPoint;
        }
        this.scene.add(newParticles.particles);
        this.transportSets.push(newParticles);
    }
}

Particles.prototype.transport = function(particle) {
    var dist = distance(particle.dest, particle);
    particle.velocity.x = 1000 * particle.destWeight * (particle.dest.x - particle.x) / dist;
    particle.velocity.y = 1000 * particle.destWeight * (particle.dest.y - particle.y) / dist;
    particle.add(particle.velocity);
}

Particles.prototype.transportByMax = function () {
    for (var i = 0; i < this.numParticles; i++) {
        this.transport(this.particles.geometry.vertices[i]);
    }
    this.particles.geometry.verticesNeedUpdate = true;
}

Particles.prototype.transportByWeight = function () {
    for (var i = 0; i < this.transportSets.length; i++) {
        for (var j = 0; j < this.numParticles; j++) {
            this.transport(this.transportSets[i].particles.geometry.vertices[j]);
        }
        this.transportSets[i].particles.geometry.verticesNeedUpdate = true;
    }
}

Particles.prototype.clone = function() {
    newParticles = new Particles(this.renderer, this.scene, this.camera, this.numParticles);
    var color = this.setColor();
    var geom = new THREE.Geometry(),
        mat = new THREE.ParticleBasicMaterial({
        color: color,
        size: 1
    });
    newParticles.particles = new THREE.Points(geom, mat);
    for (var i = 0; i < this.numParticles; i++) {
        var oldParticle = this.particles.geometry.vertices[i];
        newParticles.particles.geometry.vertices.push(new THREE.Vector3(oldParticle.x, oldParticle.y, 0));
        newParticles.particles.geometry.vertices[i].velocity = new THREE.Vector3(0, 0, 0);
    }
    return newParticles;
}

Particles.prototype.drawParticles = function() {
    if (this.particles && this.isTransporting) {
        this.transportByWeight();
    }
    this.renderer.render(scene, camera);
}

Particles.prototype.getCount = function() {
    return this.numParticles;
}

Particles.prototype.setText = function(newLetters) {
    this.letters = newLetters;
    // TODO replace draw function (see order in main.js)
    this.moveParticles(newLetters);
    this.drawParticles();
    return this;
}
