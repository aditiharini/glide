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
    BIGMAX: "bigmax"
}

var CameraTypes = {
    ORTHOGRAPHIC: 1,
    PERSPECTIVE: 2
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
}

Controller.prototype.handleModelLoad = function(startName, endName) {
    console.log("Loading mesh");
    var loader = new THREE.OBJLoader();
    var _this = this;
    loader.load('./objs/' + startName+ '.obj', 
    function(object) {
        this.scene.add(object);
        _this.initObjParticles(this.startParticles, object);
    }, 
    inProgressCallback, 
    errorCallback);
    if (!(this.startParticles.costCalculation == Cost.GEODESIC_DISTANCE)){
      loader.load('./objs/' + endName + '.obj',
      function(object){
          scene.add(object);
          _this.initObjParticles(this.endParticles, object);
      },
      inProgressCallback,
      errorCallback);
    }
}

Controller.prototype.handleCameraChange = function(cameraType) {
    var cam = null;
    if (cameraType == CameraTypes.ORTHOGRAPHIC) {
        cam = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2, 1, 1000);
        cam.position.set(0, 0, 100);
    } else {
        cam = new THREE.PerspectiveCamera(140, WIDTH/HEIGHT, 1, 1000);
        cam.position.set( 0, 0, 50);
    }
    this.startParticles.camera = cam;
    this.endParticles.camera = cam;
    this.cameraControls.object = cam;
    this.cameraControls.update();
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
    var startPoints = this.startParticles.getPoints();
    var endPoints = this.endParticles.getPoints();
    this.handleForce();
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
    }  else {
        this.displayGeodesicPath(this.startParticles)
    }
    this.startParticles.isTransporting = true;
}

Controller.prototype.initObjParticles = function (particles, obj) {
    if (this.startParticles.costCalculation == Cost.GEODESIC_DISTANCE) {
        console.log("got to geodesic");
        particles.obj = obj;
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


Controller.prototype.setupGeodesic = function (particles) {
    particles.setColor(new THREE.Color(Colors.RED));
    particles.setSize(0.5);
}

Controller.prototype.displayGeodesicPath = function(particles) {
    var vs = getVerticesObj3d(particles.obj);
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
    this.cameraControls.autoRotate = true;
}

