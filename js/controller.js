/*global updateCount x*/
var TransportMode = {
    MAX: 1,
    WEIGHTED: 2
}

var Cost = {
  DISTANCE: 1,
  COLOR: 2
}

var ForceType = {
    GRAVITY: 1,
    RANDOM: 2
}

var GRAVITY = new THREE.Vector3(0, -9.8, 0);

var inProgressCallback = function ( xhr ) {
  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}

var errorCallback = function ( error ) {
  console.log( 'An error happened' );
}

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(scene, startParticles, endParticles) {
    this.scene = scene;
    this.startParticles = startParticles;
    this.endParticles = endParticles;
    this.mousedown = false;
    var _this = this;
    this.controls = {
        startText: $('.controls .start').on('keyup', function() {
            var newText = $(this).val();
            if (newText != ""){
                _this.changeText(_this.startParticles, newText);
            }
        }),
        endText: $('.controls .end').on('keyup', function() {
            var newText = $(this).val();
            if (newText != "") {
                _this.changeText(_this.endParticles, newText)
            }
        }),
        moveText: $('.controls .move').on('click', function() {
            var startPoints = _this.startParticles.getPoints();
            var endPoints = _this.endParticles.getPoints();
            var mode = $('.controls .mode option:selected').text();
            var cost = $('.controls .cost option:selected').text();
            var force = $('.controls .force option:selected').text();
            // add obj file loading option
            if (cost == "distance") {
              _this.startParticles.costCalculation = Cost.DISTANCE;
            } else {
              _this.startParticles.costCalculation = Cost.COLOR;
              _this.startParticles.setUseRandomColors();
              _this.endParticles.setUseRandomColors();
            }
            if (mode == "max") {
                _this.startParticles.transportMode = TransportMode.MAX;
                _this.startParticles.setMappingByMax(
                  getWeights(_this.startParticles,
                             _this.endParticles,
                             _this.startParticles.costCalculation), endPoints);
            }
            else {
                _this.startParticles.transportMode = TransportMode.WEIGHTED;
                _this.startParticles.setMappingByWeight(
                  getWeights(_this.startParticles,
                             _this.endParticles,
                             _this.startParticles.costCalculation), endPoints);
            }
            if (force == "gravity") {
                _this.handleForce(ForceType.GRAVITY);
            } 
            else if (force == "random") {
                _this.handleForce(ForceType.RANDOM);
            }
            _this.startParticles.isTransporting = true;
        }),
        loadMesh: $('.controls .loadMesh').on('click', function() {
          console.log("Loading mesh");
          var startObjName = $('.controls .3d_mesh_start option:selected').text();
          var endObjName = $('.controls .3d_mesh_end option:selected').text();
          var loader = new THREE.OBJLoader();
          loader.load('./objs/' + startObjName + '.obj', 
          function(object) {
              scene.add(object);
              _this.initObjParticles(_this.startParticles, object);
          }, 
          inProgressCallback, 
          errorCallback);
          loader.load('./objs/' + endObjName + '.obj',
          function(object){
              scene.add(object);
              _this.initObjParticles(_this.endParticles, object);
          },
          inProgressCallback,
          errorCallback);
          console.log(loader);
        })
    };
}

Controller.prototype.handleForce = function(type) {
    if (type == ForceType.GRAVITY) {
        this.startParticles.addForce(new Force(GRAVITY, null, null, null));
    } else {
        var force1 = new Force(new THREE.Vector3(Math.random()*5000, Math.random()*5000, 0), 
                              new THREE.Vector3(10, 0, 0), 
                              60, 
                              5);
        this.startParticles.addForce(force1);
    }
}

Controller.prototype.changeText = function(particles, newText) {
    var loader = new THREE.FontLoader();
    loader.load(
        '../fonts/helvetiker_bold.typeface.json',
        function ( font ) {
            var letters = new Letters(newText, font);
            var canvasWidth = particles.getWidth();
            var canvasHeight = particles.getHeight();
            letters.scaleToFit(canvasWidth, canvasHeight);
            if (particles == this.startParticles) {
                letters.translate(-letters.getWidth()/2, 50);
                particles.setColor(new THREE.Color(Colors.RED));
            }
            else {
                letters.translate(-letters.getWidth()/2, -letters.getHeight());
                particles.setColor(new THREE.Color(Colors.WHITE));
            }
            particles.setSize(1);
            particles.setText(letters);
            particles.setOpacity(1.0);
        }
    );
}

Controller.prototype.initObjParticles = function (particles, obj) {
    if (particles == this.startParticles) {
        translateGeometryObj3d(obj, -100, 0, 0);
        particles.setColor(new THREE.Color(Colors.RED));
    }
    else {
        translateGeometryObj3d(obj, 100, 0, 0);
        particles.setColor(new THREE.Color(Colors.BLUE));
    }
    particles.setSize(0.3)
    particles.initObj(obj);
}
