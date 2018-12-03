var generateExpCosts = function(d1,d2) {
  var scalar = 0.05;
  var costExpMatrix = [];
  for (var i=0; i<d1.length;i++) {
    costExpMatrix[i] = [];
    for (var j=0; j<d2.length; j++) {
      dist = Math.pow((d1[i].x- d2[i].x), 2) + Math.pow(d1[i].y- d2[i].y, 2);
      //costExpMatrix[i][j] = Math.pow(Math.E, (-dist * scalar));
      costExpMatrix[i][j] = (-1 * -dist * scalar);
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
      var sums = m.reduce(sumRow);

      var err = sums.reduce(getSum) - m[0].length; // substract by num cols
      multiply(m, sums, 'row');
    } else { // scaling each column
      var sums = sumCol(m);
      var err = sums.reduce(getSum) - m.length; // substract by num cols
      multiply(m, sums, 'col');
    }
    scaleRow= !scaleRow;
  }
  return m;
}

var getWeights = function(d1,d2) {
  var costs = generateExpCosts(d1,d2);
  console.log(costs);
  var m = sinkhorn(costs);
  console.log('sdfsdf');
  console.log(m);
  return m;
}

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function maxByRow(m) {
  argMaxes = []
  m.forEach(row => {
    argMaxes.push(argMax(row));
  });
  return argMaxes;
}
