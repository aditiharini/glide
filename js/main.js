function comma(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };
})();


var particles = null,
    controller = null,
    scene = null,
    renderer = null,
    camera = null;

function updateCount() {
    var count = particles.statesize[0] * particles.statesize[1];
    $('.count').text(comma(count));
}

function render() {
    particles.drawParticles();
    requestAnimFrame(render);
}
// set the scene size
var WIDTH = window.innerWidth,
HEIGHT = window.innerHeight;

$(document).ready(function() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2, 1, 1000);
    camera.position.z = 30
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0, 0, 0));
	renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);
    particles = new Particles(renderer, scene, camera, 1000*10);
    controller = new Controller(particles);
    render()
});
