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

function scaleLetters(letters, factor) {
    letters.applyMatrix(new THREE.Matrix4().makeScale(
        factor,
        factor, 
        1
    )); 
}

function scaleToFit(letters, canvas) {
    letters.computeBoundingBox();
    var bounds = letters.boundingBox;
    // scale width first
    var lettersWidth = bounds.max.x - bounds.min.x;
    if (lettersWidth > canvas.width) {
        var scaleFactor = canvas.width / lettersWidth;
        scaleLetters(letters, scaleFactor);
    } 
    // letters.computeBoundingBox()
    // bounds = letters.boundingBox;
    // // scale height second
    // var lettersHeight = bounds.max.y - bounds.min.y;
    // if (lettersHeight > canvas.height) {
    //     var scaleFactor = canvas.height / lettersHeight;
    //     scaleLetters(letters, scaleFactor);
    // }
}

function translate(letters, deltaX, deltaY) {
    letters.applyMatrix( new THREE.Matrix4().makeTranslation(
        deltaX,
        deltaY,
        0));
}

$(document).ready(function() {
    var canvas = $('#display')[0];
    var loader = new THREE.FontLoader();
    loader.load(
        'fonts/helvetiker_bold.typeface.json',
        function ( font ) {
            var letters = new THREE.TextGeometry("ADITI SAYS HI", {
                font: font 
            });
            scaleToFit(letters, canvas);
            letters.computeBoundingBox()
            var bounds = letters.boundingBox;
            translate(letters, (canvas.width - (bounds.max.x - bounds.min.x)) * 0.5, (canvas.height - (bounds.max.y - bounds.min.y)) * 0.5);
            particles = new Particles(canvas, 1024, letters, 3).draw().start();
            controller = new Controller(particles);
            new FPS(particles);
            updateCount();
        }
    );
});
