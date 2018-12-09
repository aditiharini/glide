function generateGraph(vertices) {
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

function dijkstra(vertices, start, end) {
    var sp = {},
    distances = {},
    neighbors = generateGraph(vertices),
    curNeighbors = null,
    curNode = JSON.stringify(start);
    distances[curNode] = 0;
    sp[curNode] = true;
    while (!(JSON.stringify(end) in sp)) {
        curNeighbors = neighbors[curNode];
        for (var neighbor in curNeighbors) {
            var newDistance = distances[curNode] + distance(JSON.parse(curNode), JSON.parse(neighbor));
            if (!(neighbor in sp) && 
                (!(neighbor in distances) || 
                ( newDistance < distances[neighbor]))) {
                    distances[neighbor] = newDistance;
            }
        }
        curNode = getMin(distances, sp);
        sp[curNode] = true;
    }
    return deserializeShortestPath(sp);
}

function getMin(distances, visited) {
    var minKey = null,
        minValue = null;
    for (var node in distances) {
        if (!(node in visited) && (!minValue || distances[node] < minValue)) {
            minKey = node;
            minValue = distances[node];
        }
    }
    return minKey;
}

function deserializeShortestPath(sp) {
    arrSp = []
    for (var key in sp) {
        arrSp.push(JSON.parse(key));
    }
    return arrSp
}
