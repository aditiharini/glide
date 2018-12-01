// TODO: remove: no longer needed because would need to create constraint for each
// mmatrix element
// verified with Z3 example
var generateCost = function(d1,d2) {
  // Create mapping of dist costs

}

// {feasible: true, brit: 24, yank: 20, result: 1080000}
var solver = require("./src/solver"),
  results,
  model = {
    "optimize": "", // TODO
    "opType": "min",
    "constraints": {
        "row_assn": {"min": 1},
        "col_assn": {"min": 1},
        "assn": {"min": 0}
    },
    "variables": {
        "transition": {
            "capacity": 20000,
            "row_assn": 1,
            "col_assn": 8,
            "assn": 5000
        },
    },
};

results = solver.Solve(model);
console.log(results);
