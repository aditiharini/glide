/*global updateCount x*/
var TransportMode = {
    MAX: 1,
    WEIGHTED: 2
}

var Cost = {
  DISTANCE: 1,
  COLOR: 2
}

var loadMeshCallback = function ( object ) {
  scene.add( object );
}

var loadMeshCallback2 = function ( object ) {
  var lg = 1000;  // num particles
    scene.add( object );
    object.traverse( function ( child ) {
    if ( child instanceof THREE.Mesh ) {
        console.log (" === CHILD === ");
        console.log (child.geometry);
        // TODO: Errors with buffer geometry
        // randomPointPositions = new THREE.GeometryUtils.randomPointsInBufferGeometry( child.geometry, lg);
        // console.log (randomPointPositions[0].x, randomPointPositions[0].y, randomPointPositions[0].z );
        // for( var i = 0; i < randomPointPositions.length; i++ ){
        //    var p = allParticle[i];
        //    p.diffX = randomPointPositions[i].x * scale -p.x ;
        //    p.diffY = randomPointPositions[i].y * scale -p.y;
        //    p.diffZ = randomPointPositions[i].z * scale -p.z;
        // }
      }
    })
        // console.log("randomPointPositions");
        // console.log(randomPointPositions);
}

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
function Controller(renderer, scene, camera, startParticles, endParticles) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
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
            _this.startParticles.isTransporting = true;
            var startPoints = _this.startParticles.getPoints();
            var endPoints = _this.endParticles.getPoints();
            var mode = $('.controls .mode option:selected').text();
            var cost = $('.controls .cost option:selected').text();
            // add obj file loading option
            console.log(mode);
            console.log(cost);
            if (cost == "distance") {
              _this.startParticles.costCalculation = Cost.DISTANCE;
            } else {
              _this.startParticles.costCalculation = Cost.COLOR;
            }
            if (mode == "Max") {
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
        }),
        loadMesh: $('.controls .loadMesh').on('click', function() {
          console.log("Loading mesh");
          var obj_filename = $('.controls .3d_mesh option:selected').text();
          var loader = new THREE.OBJLoader();
          loader.load('./objs/' + obj_filename + '.obj', loadMeshCallback2, inProgressCallback, errorCallback);
          console.log(loader);
          _this.renderer.render(scene, camera);
        })
    };
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
                particles.setColor(0xFF0000);
                particles.setSize(1);
                particles.setText(letters);
                particles.setOpacity(1.0);
            }
            else {
                letters.translate(-letters.getWidth()/2, -letters.getHeight());
                particles.setColor(0xFFFFFF);
                particles.setSize(1);
                particles.setText(letters);
                particles.setOpacity(1.0);
            }
        }
    );
}
