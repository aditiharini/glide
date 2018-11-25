/* requestAnimationFrame shim */
if (window.requestAnimationFrame == null) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
}

function comma(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

var particles = null,
    controller = null,
    letter = null;

function updateCount() {
    var count = particles.statesize[0] * particles.statesize[1];
    $('.count').text(comma(count));
}
var alphabet = {
    "A":new Letter([[0, 0], [25, 25], [50, 50], [75, 25], [100, 0], [50, 25]]),
    "I": new Letter([[0, 0], [25, 0], [50, 0], [25, 25], [25, 50], [25, 75], [25, 100], [0, 100], [50, 100]]), 
};

$(document).ready(function() {
    var canvas = $('#display')[0];
    // Need to make sure anchor points are somewhat evenly spaced
    letters = [alphabet.A.translated(50, 100).scaled(3), alphabet.I.translated(200, 100).scaled(2)]
    particles = new Particles(canvas, 1024 * letters.length, letters, 3).draw().start();
    controller = new Controller(particles);
    new FPS(particles);
    updateCount();
});
