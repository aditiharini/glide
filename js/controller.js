/*global updateCount x*/

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(startParticles, endParticles) {
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
            _this.startParticles.setMapping(getWeights(startPoints, endPoints), endPoints);
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
                letters.translate(-letters.getWidth()/2, letters.getHeight()); 
            }
            else {
                letters.translate(-letters.getWidth()/2, -letters.getHeight()); 
            } 
            particles.setText(letters);
        }
    );
}
