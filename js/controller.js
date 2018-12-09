/*global updateCount x*/
var TransportMode = {
    MAX: 1,
    WEIGHTED: 2
}

var Cost = {
  DISTANCE: 1,
  COLOR: 2,
  GEODESIC_DISTANCE: 3
}

var ForceType = {
    NONE: 1,
    GRAVITY: 2,
    RANDOM: 3
}

var Models = {
    BIGMAX: 1
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
function Controller(scene, cameraControls, startParticles, endParticles) {
    this.scene = scene;
    this.startParticles = startParticles;
    this.endParticles = endParticles;
    this.mousedown = false;
    this.cameraControls = cameraControls;
    var _this = this;
    this.controls = {
        camPersp: $('.controls .persp input[name=cam]:radio').on('change', function() {
            var val = $('input[name=cam]:checked').val();
            var cam = null;
            if (val == "ortho") {
                console.log("got to ortho");
                cam = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2, 1, 1000);
                cam.position.set(0, 0, 10);
            } else {
                cam = new THREE.PerspectiveCamera(140, WIDTH/HEIGHT, 1, 1000);
                cam.position.set( 0, 0, 50);
            }
            _this.startParticles.camera = cam;
            _this.endParticles.camera = cam;
            _this.cameraControls.object = cam;
            _this.cameraControls.update();
        }),
        moveText: $('.controls .move').on('click', function() {
            var force = $('.controls .force option:selected').text();
            // add obj file loading option
            if (force == "gravity") {
                _this.handleForce(ForceType.GRAVITY);
            } 
            else if (force == "random") {
                _this.handleForce(ForceType.RANDOM);
            }
            return false;
        }),
        loadMesh: $('.controls .loadMesh').on('click', function() {
          console.log("Loading mesh");
          var startObjName = $('.controls .3d_mesh_start option:selected').text();
          var endObjName = $('.controls .3d_mesh_end option:selected').text();
          if ($('.controls .cost option:selected').text() == "geodesic distance") {
            _this.cameraControls.autoRotate = true;
            _this.startParticles.costCalculation = Cost.GEODESIC_DISTANCE;
          }
          var loader = new THREE.OBJLoader();
          loader.load('./objs/' + startObjName + '.obj', 
          function(object) {
              scene.add(object);
              _this.initObjParticles(_this.startParticles, object);
          }, 
          inProgressCallback, 
          errorCallback);
          if (!(_this.startParticles.costCalculation == Cost.GEODESIC_DISTANCE)){
            loader.load('./objs/' + endObjName + '.obj',
            function(object){
                scene.add(object);
                _this.initObjParticles(_this.endParticles, object);
            },
            inProgressCallback,
            errorCallback);
          }
          console.log(loader);
          return false;
        })
    };
}

Controller.prototype.handleForce = function(type) {
    if (this.startParticles.forceType == ForceType.GRAVITY) {
        this.startParticles.addForce(new Force(GRAVITY, null, null, null));
    } else if (this.startParticles.forceType == ForceType.RANDOM){
        var force1 = new Force(new THREE.Vector3(Math.random()*5000, Math.random()*5000, 0), 
                              new THREE.Vector3(10, 0, 0), 
                              60, 
                              5);
        this.startParticles.addForce(force1);
    }
}

Controller.prototype.changeText = function(particles, newText) {
    var cost = $('.controls .cost option:selected').text();
    if (cost == "color") {
        this.startParticles.setUseRandomColors();
        this.endParticles.setUseRandomColors();
    }
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
            particles.setSize(5);
            particles.setText(letters);
            particles.setOpacity(1.0);
        }
    );
}

Controller.prototype.startTransport = function () {
    console.log("got to start transport");
    var startPoints = this.startParticles.getPoints();
    var endPoints = this.endParticles.getPoints();
    this.handleForce();
    if (this.startParticles.costCalculation == Cost.COLOR) {
        this.startParticles.setUseRandomColors();
    }
    if (this.startParticles.transportMode == TransportMode.MAX) {
        this.startParticles.setMappingByMax(
            getWeights(this.startParticles,
                       this.endParticles,
                       this.startParticles.costCalculation), endPoints);
    } else if (this.startParticles.transportMode == TransportMode.WEIGHTED) {
        this.startParticles.setMappingByWeight(
            getWeights(this.startParticles,
                        this.endParticles,
                        this.startParticles.costCalculation), endPoints);
    } 
    this.startParticles.isTransporting = true;
}

Controller.prototype.initObjParticles = function (particles, obj) {
    if (this.startParticles.costCalculation == Cost.GEODESIC_DISTANCE) {
        this.setupGeodesic(particles, obj);
        this.displayGeodesicPath(particles, obj);
        return;
    } else if (particles == this.startParticles) {
        translateGeometryObj3d(obj, -50, 0, 0);
        particles.setColor(new THREE.Color(Colors.RED));
    }
    else {
        translateGeometryObj3d(obj, 50, 0, 0);
        particles.setColor(new THREE.Color(Colors.BLUE));
    }
    particles.setSize(1)
    particles.initObj(obj);
}

Controller.prototype.loadMeshes = function (file) {

}

Controller.prototype.setupGeodesic = function (particles, obj) {
    particles.setColor(new THREE.Color(Colors.RED));
    particles.setSize(0.5);
}

Controller.prototype.displayGeodesicPath = function(particles, obj) {
    var vs = getVerticesObj3d(obj);
    var start = vs[Math.round(Math.random() * vs.length)]
    var dest = vs[Math.round(Math.random() * vs.length)]
    console.log(start);
    console.log(dest);
    // It's not working with the randomized points for some reason and I don't know why 
    // and don't have time to figure it out
    var sp = dijkstra(vs, vs[0], vs[500]);
    particles.initPoints([vs[0], vs[500]]);
    console.log(sp);
    var geometry = new THREE.BufferGeometry().setFromPoints( sp );
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var curveObject = new THREE.Line( geometry, material );
    this.scene.add(curveObject);
}

