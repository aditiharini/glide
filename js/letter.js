function Letters(text, font){
    console.log(text);
    this.shape = new THREE.TextGeometry(text, {
        font: font
    });
};

Letters.prototype.getWidth = function() {
    this.shape.computeBoundingBox();
    var bounds = this.shape.boundingBox;
    return bounds.max.x - bounds.min.x
}

Letters.prototype.getHeight = function() {
    this.shape.computeBoundingBox();
    var bounds = this.shape.boundingBox;
    return bounds.max.y - bounds.min.y
}

Letters.prototype.samplePoints = function(numPoints) {
    console.log("in samplepoints");
    console.log(this.shape);
    return THREE.GeometryUtils.randomPointsInGeometry(this.shape, numPoints)
}

Letters.prototype.scale = function (factor) {
    this.shape.applyMatrix(new THREE.Matrix4().makeScale(
        factor,
        factor,
        1
    ));
}

Letters.prototype.scaleToFit = function (width, height) {
    var lettersWidth = this.getWidth()
    if (lettersWidth > width) {
        var scaleFactor = width / lettersWidth;
        this.scale(scaleFactor);
    }
}

Letters.prototype.translate = function (deltaX, deltaY) {
    this.shape.applyMatrix( new THREE.Matrix4().makeTranslation(
        deltaX,
        deltaY,
        0));
}
