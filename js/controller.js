/*global updateCount x*/
var TransportMode = {
    MAX: 1,
    WEIGHTED: 2
}
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
        // particleSize: $('.controls .size').on('keyup', function() {
        //     var size = $(this).val();
        //     if (size != "") {
        //         _this.changeText(_this.endParticles, size)
        //     }
        // }),
        moveText: $('.controls .move').on('click', function() {
            _this.startParticles.isTransporting = true;
            var startPoints = _this.startParticles.getPoints();
            var endPoints = _this.endParticles.getPoints();
            var mode = $('.controls .mode option:selected').text();
            console.log(mode);
            if (mode == "Max") {
                _this.startParticles.transportMode = TransportMode.MAX;
                _this.startParticles.setMappingByMax(getWeights(startPoints, endPoints), endPoints);
            }
            else {
                _this.startParticles.transportMode = TransportMode.WEIGHTED;
                _this.startParticles.setMappingByWeight(getWeights(startPoints, endPoints), endPoints);
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
            }
            else {
                letters.translate(-letters.getWidth()/2, -letters.getHeight());
                particles.setColor(0xFFFFFF);
                particles.setSize(1);
                particles.setText(letters);
            }
        }
    );
}
