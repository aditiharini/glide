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

function applyDynamics(particles) {
// particles.letters.vertices = array of point positions
// TODO insert optimal transport algorithm here
  for (var i in particles)  {
    var particle = particles[i];
    particle.x += Math.random();
    particle.y += Math.random();
  }
}

function killParticles() {
	for (var i in particles) {
		var particle = particles[i];
		if (particle.y > canvas.height) {
			particle.y = 0
		}
	}
}

function drawParticles() {
  c.fillStyle = "black";
  c.fillRect(0,0,canvas.width,canvas.height);
  for(var i in particles) {
      var part = particles[i];
      c.beginPath();
      c.arc(part.x,part.y, part.radius, 0, Math.PI*2);
      c.closePath();
      c.fillStyle = part.color;
      c.fill();
  }
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
