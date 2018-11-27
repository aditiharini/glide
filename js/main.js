/* requestAnimationFrame shim */
if (window.requestAnimationFrame == null) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
    console.log(window.requestAnimationFrame);
}


var alphabet = {
    "A":new Letter([[0, 0], [25, 25], [50, 50], [75, 25], [100, 0], [50, 25]]),
    "I": new Letter([[0, 0], [25, 0], [50, 0], [25, 25], [25, 50], [25, 75], [25, 100], [0, 100], [50, 100]]),
};

function comma(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

var particles = null,
    controller = null;

function updateCount() {
    var count = particles.statesize[0] * particles.statesize[1];
    $('.count').text(comma(count));
}

$(document).ready(function() {
    var canvas = $('#display')[0];
    particles = new Particles(canvas, 1024, null, 3).draw().start();
    controller = new Controller(particles);
    new FPS(particles);
});
