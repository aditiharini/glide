var euclideanDistance2 = function(ps1,ps2,i,j) {
  d1 = ps1.getPoints();
  d2 = ps2.getPoints();
  var p1 = d1[i];
  var p2 = d2[j];
  return Math.pow((p1.x- p2.x), 2) + Math.pow(p1.y- p2.y, 2);
}

var colorCost = function(ps1,ps2,i,j) {
  var c1 = ps1.particles.geometry.colors[i];
  var c2 = ps2.particles.geometry.colors[j];
  return Math.pow((c1.r-c2.r), 2) + Math.pow((c1.g-c2.g), 2) + Math.pow((c1.b-c2.b), 2);
}

var generateCosts = function(ps1,ps2, costFunction, scalar) {
  d1 = ps1.getPoints();
  d2 = ps2.getPoints();
  var costExpMatrix = [];
  for (var i=0; i<d1.length;i++) {
    costExpMatrix[i] = []
    for (var j=0; j<d2.length; j++) {
      dist = costFunction(ps1, ps2, i, j);
      exp = -1* dist * scalar
      val = Math.pow(Math.E,exp);
      costExpMatrix[i][j] =val;
    }
  }
  return costExpMatrix;
}


var sumRow = (r, a) => r.map((b, i) => a[i] + b);

var sumCol = function(c) {
	return c.map(function(y){
    	return y.reduce(function(a,b){
        	return a+b;
	    })
	})
}

function getSum(total,num) {
  return total + num;
}

function multiply(m, scalarCol, method){
  for (var i=0; i<m.length;i++) { // # rows
    for (var j=0; j<m[i].length; j++) { // # cols
      if (method == 'row') {
        m[i][j] *= 1./scalarCol[i];
      } else {
        m[i][j] *= 1./scalarCol[j];
      }
    }
  }
}

var sinkhorn = function(m, scaleRow=true, err=1.0, i=0, timeout=100, stopThres=1e-9) {
  while(Math.abs(err) > stopThres && i < timeout) {
    i += 1;
    if (scaleRow) { // scaling each Row
      var sums = sumCol(m);
      multiply(m, sums, 'row');
      err = sums.reduce(getSum) - m[0].length; // substract by num cols
    } else { // scaling each column
      var sums = m.reduce(sumRow);
      err = sums.reduce(getSum) - m.length; // substract by num cols
      multiply(m, sums, 'col');
    }
    scaleRow= !scaleRow;
  }
  return m;
}

var getWeights = function(ps1,ps2,costMode) {
  // var d1 = ps1.getPoints()
  // var d2 = ps2.getPoints()
  var costFunction = (costMode == Cost.DISTANCE) ? euclideanDistance2 : colorCost;
  var costs = generateCosts(ps1,ps2, costFunction, 0.00005);
  var m = sinkhorn(costs);
  return m;
}

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function argMin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

function maxByRow(m) {
  argMaxes = []
  m.forEach(row => {
    argMaxes.push(argMax(row));
  });
  return argMaxes;
}
