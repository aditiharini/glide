/*global updateCount x*/
var TransportMode = {
    MAX: 1,
    WEIGHTED: 2
}

var Cost = {
  DISTANCE: 1,
  COLOR: 2
}

var test = function() {
// instantiate a loader
// var loader = new THREE.OBJLoader();

// load a resource
loader.load(
	// resource URL
	'objs/bigmax.obj',
	// called when resource is loaded
	function ( object ) {

		scene.add( object );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);
}

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(startParticles, endParticles) {
    this.startParticles = startParticles;
    this.endParticles = endParticles;
    this.mousedown = false;
    // test()
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
