var Colors = {
  BLUE: 0x0000ff,
  RED: 0xff0000,
  WHITE:0xffffff,
  GREEN:0x00ff00
}

function Particles(renderer, scene, camera, numParticles) {
    this.renderer = renderer;
    this.scene = scene;
    this.numParticles = numParticles;
    this.camera = camera;
    this.isTransporting = false;
    this.transportMode = null;
    this.costCalculation = null;
    this.color = null;
    this.size = null;
    this.transparent = true;
    this.opacity = null;
    this.colorProbability = 0.5;
    this.enableGravity = false; 
}

Particles.prototype.getColorProbability = function() {
     return !!this.colorProbability && Math.random() <= this.colorProbability;
};

Particles.prototype.getWidth = function() {
    return this.renderer.getSize().width;
}

Particles.prototype.getHeight = function() {
    return this.renderer.getSize().height;
}

Particles.prototype.getPoints = function() {
    return this.particles.geometry.vertices;
}

Particles.prototype.getVertex = function(i) {
    return this.particles.geometry.vertices[i];
}

Particles.prototype.determineColor = function() {
  if (this.getColorProbability()) {
    return new THREE.Color(Colors.GREEN);
  } else {
    return new THREE.Color(Colors.BLUE);
  }
}

Particles.prototype.getVertexColor = function(i) {
    return this.particles.geometry.colors[i];
}

Particles.prototype.setVertexColor = function(i, color) {
    this.particles.geometry.colors[i] = color;
}

Particles.prototype.pushVertexColor = function(color) {
    this.particles.geometry.colors.push(color);
}

Particles.prototype.setVertexVelocity = function(i, velocity) {
    this.getVertex(i).velocity = velocity;
}

Particles.prototype.setVertexPosition = function(i, position) {
    var vert = this.getVertex(i);
    vert.x = position.x;
    vert.y = position.y;
    vert.z = position.z;
}

Particles.prototype.pushVertex = function(vertex) {
    this.particles.geometry.vertices.push(vertex);
}

Particles.prototype.applyVertexVelocities = function () {
    this.particles.geometry.verticesNeedUpdate = true;
}

Particles.prototype.applyVertexColors = function () {
    this.particles.geometry.colorsNeedUpdate = true;
}

Particles.prototype.setVertexWeight= function(i, weight) {
    this.getVertex(i).destWeight = weight;
}

Particles.prototype.getVertexWeight= function(i, weight) {
    return this.getVertex(i).destWeight;
}

Particles.prototype.setVertexDestination = function(i, dest) {
    this.getVertex(i).dest = dest;
}

Particles.prototype.getVertexDestination = function(i, dest) {
    return this.getVertex(i).dest;
}

Particles.prototype.moveParticle = function(i) {
    var particle = this.getVertex(i);
    particle.add(particle.velocity);
}

Particles.prototype.createParticles = function(letters, numParticles) {
    var geom = new THREE.Geometry(),
        mat = new THREE.PointsMaterial({
            size: this.size,
            vertexColors: THREE.VertexColors
            // transparent: this.transparent,
            // opacity: this.opacity
        });
    var particles = new THREE.Points(geom, mat);
    this.particles = particles;
    this.scene.add(particles);
    var points = letters.samplePoints(numParticles);
    for (var i = 0; i < numParticles; i++) {
        var point = new THREE.Vector3(points[i].x, points[i].y, 0)
        point.velocity = new THREE.Vector3(0, 0, 0);
        this.pushVertex(point);
        
        var color = this.determineColor();
        this.pushVertexColor(color);
    }
    this.applyVertexColors();
    this.applyVertexVelocities()
}

Particles.prototype.moveParticles = function(letters) {
    if (!this.particles) {
        this.createParticles(letters, this.numParticles);
        return this;
    }
    var points = letters.samplePoints(this.numParticles);
    for (var i = 0; i < this.numParticles; i++) {
        this.setVertexPosition(i, points[i]);
    }
    this.applyVertexVelocities();
    return this;
}

Particles.prototype.setMappingByMax = function(weights, endPoints) {
    var weights = maxByRow(weights);
    for (var i = 0; i < this.numParticles; i++) {
        var endPoint = endPoints[weights[i]];
        this.setVertexDestination(i, endPoint);
        this.setVertexWeight(i, 1);
    }
}

Particles.prototype.setMappingByWeight = function(weights, endPoints) {
    this.transportSets = [];
    for (var i = 0; i < weights[0].length; i++) {
        var newParticles = this.clone();
        var endPoint = endPoints[i];
        for (var j = 0; j < this.numParticles; j++) {
            newParticles.setVertexWeight(j, weights[j][i]);
            newParticles.setVertexDestination(j, endPoint)
        }
        this.scene.add(newParticles.particles);
        this.transportSets.push(newParticles);
    }
}

Particles.prototype.transport = function(particleNum, scaleFactor) {
    var weight = this.getVertexWeight(particleNum);
    var start = this.getVertex(particleNum);
    var dest = this.getVertexDestination(particleNum);
    var dist = distance(dest, start);
    var newVelocity = new THREE.Vector3(
        scaleFactor * weight * (dest.x - start.x) / dist,
        scaleFactor * weight * (dest.y - start.y) / dist,
        0
    );
    this.setVertexVelocity(particleNum, newVelocity);
    this.moveParticle(particleNum);
}


Particles.prototype.transportByMax = function () {
    for (var i = 0; i < this.numParticles; i++) {
        this.transport(i, 1);
    }
    this.applyVertexVelocities();
}

Particles.prototype.transportByWeight = function () {
    for (var i = 0; i < this.transportSets.length; i++) {
        for (var j = 0; j < this.numParticles; j++) {
            this.transportSets[i].transport(j, 1000);
        }
        this.transportSets[i].applyVertexVelocities();
        this.transportSets[i].applyVertexColors();
    }
}

Particles.prototype.clone = function() {
    newParticles = new Particles(this.renderer, this.scene, this.camera, this.numParticles);
    var geom = new THREE.Geometry(),
        mat = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: this.size
        // transparent: this.transparent,
        // opacity: this.opacity
    });
    newParticles.particles = new THREE.Points(geom, mat);
    for (var i = 0; i < this.numParticles; i++) {
        var oldVertex = this.getVertex(i);
        var oldColor = this.getVertexColor(i);
        newParticles.pushVertex(new THREE.Vector3(oldVertex.x, oldVertex.y, 0));
        newParticles.setVertexVelocity(i, new THREE.Vector3(0, 0, 0));
        newParticles.pushVertexColor(new THREE.Color(oldColor.r, oldColor.g, oldColor.b));
    }
    newParticles.applyVertexColors()
    return newParticles;
}

Particles.prototype.drawParticles = function() {
    if (this.particles && this.isTransporting) {
        if (this.transportMode == TransportMode.MAX){
            this.transportByMax();
        } else {
            this.transportByWeight();
        }
    }
    this.renderer.render(scene, camera);
}

Particles.prototype.getCount = function() {
    return this.numParticles;
}

Particles.prototype.setColor = function(color) {
    this.color = color;
}

Particles.prototype.setOpacity = function(opacity) {
  this.opacity = opacity;
}

Particles.prototype.setSize = function(size) {
  this.size = size;
}

Particles.prototype.setText = function(newLetters, color) {
    this.letters = newLetters;
    this.moveParticles(newLetters, color);
    this.drawParticles();
    return this;
}
