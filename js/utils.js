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

function getVerticesObj3d(obj) {
    var numChildren = obj.children.length;
    var vertices = [];
    if (numChildren == 0) {
        var allCoords = obj.geometry.getAttribute('position').array;
        for (var i = 0; i < allCoords.length; i+=3) {
            vertices.push(new THREE.Vector3(allCoords[i], allCoords[i+1], allCoords[i+2]));
        }
        return vertices;
    }
    for (var i = 0; i < numChildren; i++) {
        vertices.push(...getVerticesObj3d(obj.children[i]));
    }
    return vertices;
}

function translateGeometryObj3d(obj, deltaX, deltaY, deltaZ) {
    var numChildren = obj.children.length;
    if (numChildren == 0) {
        obj.geometry.translate(deltaX, deltaY, deltaZ);
        return;
    }
    for (var i = 0; i < numChildren; i++) {
        translateGeometryObj3d(obj.children[i], deltaX, deltaY, deltaZ);
    }
}

function generateGraphObj3d(vertices) {
    var neighbors = {};
    for (var i = 0; i < vertices.length; i+=3) {
        var v1 = vertices[i],
            v2 = vertices[i+1],
            v3 = vertices[i+2];
        var sv1 = JSON.stringify(v1), 
            sv2 = JSON.stringify(v2),
            sv3 = JSON.stringify(v3);
        if (!(sv1 in neighbors)) {
            neighbors[sv1] = {};
        }
        if (!(sv2 in neighbors)) {
            neighbors[sv2] = {};
        }
        if (!(sv3 in neighbors)) {
            neighbors[sv3] = {};
        }
        neighbors[sv1][sv2] = true;
        neighbors[sv1][sv3] = true;

        neighbors[sv2][sv1] = true;
        neighbors[sv2][sv3] = true;

        neighbors[sv3][sv1] = true;
        neighbors[sv3][sv2] = true;
    }
    return neighbors;
}

function dijkstra(neighbors, start, end) {

}

