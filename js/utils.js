function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.y-p1.y, 2) + Math.pow(p2.x-p1.x, 2) + Math.pow(p2.z-p1.z, 2));
}

function sampleObj3d(obj, numPoints) {
    var numChildren = obj.children.length;
    var points = []
    if (numChildren == 0) {
        return THREE.GeometryUtils.randomPointsInBufferGeometry(obj.geometry, numPoints);
    }
    for (var i = 0; i < numChildren; i++) {
        var numChildPoints = Math.round(numPoints/numChildren);
        if (i < numPoints % numChildren) {
            numChildPoints += 1;
        }
        points.push(...sampleObj3d(obj.children[i], numChildPoints));
    }
    return points
}
