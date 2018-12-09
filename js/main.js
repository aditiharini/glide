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


var startParticles = null,
    endParticles = null,
    controller = null,
    scene = null,
    renderer = null,
    camera = null,
    ambientLight = null,
    controls = null,
    particleSprite = null;

function updateCount() {
    var count = particles.statesize[0] * particles.statesize[1];
    $('.count').text(comma(count));
}

function render() {
    startParticles.drawParticles();
    endParticles.drawParticles();
    controls.update();
    requestAnimFrame(render);
}
// set the scene size
var WIDTH = window.innerWidth,
HEIGHT = window.innerHeight;

$(document).ready(function() {
    scene = new THREE.Scene();
    // camera = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2, 1, 1000);
    // camera.position.set( 0.0, 0, 30);
    camera = new THREE.PerspectiveCamera(140, WIDTH/HEIGHT, 1, 1000);
    camera.position.set( 0, 0, 50);
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0, 0, 0));
  	renderer.setSize(WIDTH, HEIGHT);
    controls = new THREE.OrbitControls(camera, renderer.domElement); 
    controls.update();
    document.body.appendChild(renderer.domElement);
    particleSprite = new THREE.TextureLoader().load( './sprites/disc.png');
    startParticles = new Particles(renderer, scene, camera, particleSprite, 1000*2);
    startParticles.isStart = true;
    endParticles = new Particles(renderer, scene, camera, particleSprite, 1000*2);
    controller = new Controller(scene, controls, startParticles, endParticles);
    var text = {
        start: "",
        end: ""
    };    
    var cameraMode = {
        orthographic: false,
        perspective: false, 
    }
    var gui = new dat.GUI();
    gui.add(startParticles, 'costCalculation', Cost).name("cost metric").onChange(function(){
        if (startParticles.costCalculation == Cost.COLOR) {
            console.log("got to set random colors");
            startParticles.setUseRandomColors();
            endParticles.setUseRandomColors();
        }
    })
    gui.add(startParticles, 'transportMode', TransportMode).name("map heuristic");
    gui.add(startParticles, 'forceType', ForceType).name("force");
    var cameraF = gui.addFolder('Camera');
    var textF = gui.addFolder('Text');
    var modelF = gui.addFolder('Model');
    textF.add(text, 'start').onChange(function(){
        controller.changeText(startParticles, text.start);
    });
    textF.add(text, 'end').onChange(function(){
        controller.changeText(endParticles, text.end);
    });
    var modelFiles = {
        start: null,
        end: null,
    };
    var model = {
        load:function(){
            controller.handleModelLoad(modelFiles.start, modelFiles.end)
        }
    }
    modelF.add(modelFiles, 'start', Models);
    modelF.add(modelFiles, 'end', Models);
    modelF.add(model, 'load').name("load!");
    cameraF.add(cameraMode, 'orthographic').listen().onChange(function(){
        cameraMode.perspective = false;
        cameraMode.orthographic = true;
        controller.handleCameraChange(CameraTypes.ORTHOGRAPHIC);
    });
    cameraF.add(cameraMode, 'perspective').listen().onChange(function() {
        cameraMode.orthographic = false;
        cameraMode.perspective = true;
        controller.handleCameraChange(CameraTypes.PERSPECTIVE);
    });
    cameraMode.perspective = true;
    gui.add(controller, 'startTransport').name("transport!");
    gui.open();
    render()
});
