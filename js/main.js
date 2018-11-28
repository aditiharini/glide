/* requestAnimationFrame shim */
if (window.requestAnimationFrame == null) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

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

    // TODO:  Include main loop in rendering  particles

			// // Main loop for rendering particles
			// function loop() {
			// 	window.requestAnimFrame(loop);
			// 	createParticles();
			// 	updateParticles();
			// 	killParticles();
			// 	drawParticles();
			// }
			// window.requestAnimFrame(loop);
    new FPS(particles);
});
