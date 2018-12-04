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
    return THREE.GeometryUtils.randomPointsInGeometry(this.shape, numPoints)
}

Letters.prototype.scale = function (factor) {
    this.shape.scale(factor, factor, 0); 
}

Letters.prototype.scaleToFit = function (width, height) {
    if (this.getWidth() > width) {
        this.scale(width/this.getWidth());
    }
}

Letters.prototype.translate = function (deltaX, deltaY) {
    this.shape.translate(deltaX, deltaY, 0);
}
