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

// TODO make sumRow and getSum the same function
// TODO correct mapping of sum by Row and by Columm
var sumRow = (r, a) => r.map((b, i) => a[i] + b);
var sumCol = (r, a) => r.map((b, i) => a[i] + b);

function getSum(total,num) {
  return total + num;
}

var sinkhorn = function(m, scaleRow=true, err=1.0, i=0, timeout=100, stopThres=1e-9) {

	// while (abs(err) > stopThres and i < timeout):
  while( abs(err) > stopThres && i < timeout) {
    i += 1;
    if (scaleRow) { // scaling each Row
      var sums = m.reduce(sumRow);
      var err = sums.reduce(getSum) - m[0].size; // substract by num cols
      var scalar = 1.0/sums;
      // TODO: need to check whether this actually matrix multiplies
      m = math.dotMultiply(m, scalar);
    	// 		sums = np.sum(t, axis=1)
    	// 		err = np.sum(sums) - m
    	// 		scalar = 1.0/sums
    	// 		t = (t.transpose() * scalar).transpose()
    	// 		print(t)
    	// 		print("new sum {} by rows".format(np.sum(t, axis=1)))
      scaleRow= !scaleRow;
    } else { // scaling each column
      var sums = m.reduce(sumCol);
      var err = sums.reduce(getSum) - m.size; // substract by num cols
      var scalar = 1.0/sums;
      m = math.dotMultiply(m, scalar);
      // 		sums = np.sum(t, axis=0)
      // 		err = np.sum(sums) - n
      // 		scalar = 1.0/sums
      // 		t =  t * scalar.transpose()
      // 		print(t)
      // 		print("new sum {} by cols".format(np.sum(t, axis=0)))
    }
  }
  return m;
}
