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
    parent = {},
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
                    parent[neighbor] = curNode;
            }
        }
        curNode = getMin(distances, sp);
        sp[curNode] = true;
    }
    return deserializeShortestPath(getShortestPath(JSON.stringify(end), parent));
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

function getShortestPath(end, parent){
    var curNode = end;
    var path = []
    while (curNode) {
        path.push(curNode);
        if (!(curNode in parent)){
            console.log(path);
            return path;
        }
        curNode = parent[curNode];
    }
}

function deserializeShortestPath(sp) {
    arrSp = []
    sp.forEach(element => {
        arrSp.push(JSON.parse(element));
    });
    return arrSp
}
