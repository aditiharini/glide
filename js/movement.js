var generateExpCosts = function(d1,d2) {
  var scalar = 0.05;
  var costExpMatrix = [];
  var d1_p = d1.particles.geometry.vertices;
  var d2_p = d2.particles.geometry.vertices;
  for (var i=0; i<d1.length;i++) {
    costExpMatrix[i] = [];
    for (var j=0; j<d2.length; j++) {
      dist = (d1_p[i].x- d2_p[i].x) * (d1_p[i].x- d2_p[i].x) + (d1_p[i].y- d2_p[i].y) * (d1_p[i].y- d2_p[i].y);
      costExpMatrix[i][j] = Math.pow(Math.E, (-dist * scalar));
    }
  }
  return costExpMatrix;
}

var sumRow = (r, a) => r.map((b, i) => a[i] + b);
var sumCol = function(a) {
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
        m[i][j] *= 1./scalar[i];
      } else {
        m[i][j] *= 1./scalar[j];
      }
    }
  }
}

var sinkhorn = function(m, scaleRow=true, err=1.0, i=0, timeout=100, stopThres=1e-9) {
  while( abs(err) > stopThres && i < timeout) {
    i += 1;
    if (scaleRow) { // scaling each Row
      var sums = m.reduce(sumRow);
      var err = sums.reduce(getSum) - m[0].size; // substract by num cols
      m = multiply(m, sums, 'row');
      scaleRow= !scaleRow;
    } else { // scaling each column
      var sums = sumCol(m);
      var err = sums.reduce(getSum) - m.size; // substract by num cols
      m = multiply(m, sums, 'col');
    }
  }
  return m;
}
