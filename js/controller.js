/*global updateCount x*/

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(startParticles, endParticles) {
    this.startParticles = startParticles;
    this.endParticles = endParticles;
    this.mousedown = false;
    console.log(this.startParticles)

    var _this = this;

    this.controls = {
        increase: $('.controls .increase').on('click', function() {
            _this.adjust(2);
        }),
        decrease: $('.controls .decrease').on('click', function() {
            _this.adjust(0.5);
        }),
        pcolor: $('.controls .particles .color').on('change', function(event) {
            var value = $(event.target).val();
            _this.particles.color = Controller.parseColor(value);
        }),
        reset: $('.controls .reset').on('click', function() {
            _this.adjust(1);
        }),
        psize: $('.controls .particles .size').on('input', function() {
            _this.particles.size = Number($(this).val());
        }),
        clear: $('.controls .clear').on('click', function() {
            _this.clear();
        }),
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
            _this.startParticles.isMoving = true;
        })
        

    };
}

Controller.prototype.changeText = function(particles, newText) {
    var loader = new THREE.FontLoader();
    loader.load(
        '../fonts/helvetiker_bold.typeface.json',
        function ( font ) {
            console.log(particles);
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
            // letters.translate((canvasWidth - letters.getWidth()) * 0.5, (canvasHeight - letters.getHeight()) * 0.5);
            particles.setText(letters);
        }
    );
}

/**
 * Immediately adjust the particle count.
 * @param {number} factor multiplies the particle count
 * @returns {Controller} this
 */
Controller.prototype.adjust = function(factor) {
    var current = this.particles.getCount();
    this.particles.setCount(Math.max(1, current * factor));
    updateCount();
};


/**
 * @param {string} color
 * @returns {Array} a 4-element color array
 */
Controller.parseColor = function(color) {
    var colors = /#(..)(..)(..)/.exec(color).slice(1).map(function(x) {
        return parseInt(x, 16) / 255;
    });
    colors.push(1);
    return colors;
};
