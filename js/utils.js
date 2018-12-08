function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.y-p1.y, 2) + Math.pow(p2.x-p1.x, 2));
}

function sampleObj3d(obj, numPoints) {
    var numChildren = obj.children.length;
    var points = []
    if (numChildren == 0) {
        return THREE.GeometryUtils.randomPointsInBufferGeometry(obj.geometry, numPoints);
    }
    for (var i = 0; i < numChildren; i++) {
        points.push(...sampleObj3d(obj.children[i], Math.round(numPoints/numChildren)));
    }
    return points
}