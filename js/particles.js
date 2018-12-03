function Particles(renderer, scene, camera, numParticles) {
    this.renderer = renderer;
    this.scene = scene;
    this.numParticles = numParticles;
    this.camera = camera;  
    this.isTransporting = false;
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

Particles.prototype.createParticles = function(letters, numParticles) {
    var geom = new THREE.Geometry(),
        mat = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
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

Particles.prototype.setMapping = function(weights, endPoints) {
    var weights = maxByRow(weights);
    for (var i = 0; i < this.numParticles; i++) {
        var startPoint = this.particles.geometry.vertices[i];
        var endPoint = endPoints[weights[i]];
        var distance = Math.sqrt(Math.pow(endPoint.y-startPoint.y, 2) + Math.pow(endPoint.x-startPoint.x, 2));
        startPoint.dest = endPoint;
        startPoint.velocity.x = (endPoint.x - startPoint.x) / distance;
        startPoint.velocity.y = (endPoint.y - startPoint.y) / distance;
    }
}

Particles.prototype.drawParticles = function() {
    if (this.particles) {
        for (var i = 0; i < this.numParticles; i++) {
            var particle = this.particles.geometry.vertices[i];
            if (this.isTransporting) {
                var distance = Math.sqrt(Math.pow(particle.dest.y-particle.y, 2) + Math.pow(particle.dest.x-particle.x, 2));
                particle.velocity.x = (particle.dest.x - particle.x) / distance;
                particle.velocity.y = (particle.dest.y - particle.y) / distance;
                particle.add(particle.velocity)
            }
        }
        this.particles.geometry.verticesNeedUpdate = true;
    }
    this.renderer.render(scene, camera);
}

Particles.prototype.getCount = function() {
    return this.numParticles;
}

/**
 * Set a new particle count. This is a minimum and the actual count
 * may be slightly higher to fill out a texture.
 * @param {number} n
 * @returns {Particles} this
 */
Particles.prototype.setCount = function(n) {
    var tw = Math.ceil(Math.sqrt(n)),
        th = Math.floor(Math.sqrt(n));
    this.statesize = new Float32Array([tw, th]);
    return this;
};

Particles.prototype.setText = function(newLetters) {
    this.letters = newLetters;
    // TODO replace draw function (see order in main.js)
    this.moveParticles(newLetters);
    this.drawParticles();
    return this;
}


