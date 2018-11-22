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
    controller = null;

function updateCount() {
    var count = particles.statesize[0] * particles.statesize[1];
    $('.count').text(comma(count));
}

$(document).ready(function() {
    var canvas = $('#display')[0];
    letter = [[75, 50], [100, 50], [125, 50], [100, 100], [100, 150], [75, 150], [125, 150]];
    particles = new Particles(canvas, 20, letter, 3).draw().start();
    controller = new Controller(particles);
    new FPS(particles);
    updateCount();
});
