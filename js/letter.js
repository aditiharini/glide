function Letter(points){
    this.points = points;
};

Letter.prototype.numPoints = function() {
    return this.points.length; 
};

Letter.prototype.getRandomPoint = function() {
    return this.points[Math.floor(Math.random() * this.numPoints())];
};

Letter.prototype.getRandomPointWithJittering = function() {
    var random_point = this.getRandomPoint();
    return [random_point[0] + (Math.random() * 100 - 50), random_point[1] + (Math.random() * 100 - 50)];
}

Letter.prototype.scaled = function(factor) {
    scaled_points = [];
    this.points.forEach(element => {
        scaled_points.push([element[0] * factor, element[1] * factor]);
    })
    return new Letter(scaled_points);
}

Letter.prototype.translated = function(deltaX, deltaY) {
    translated_points = []
    this.points.forEach(element => {
        translated_points.push([element[0] + deltaX, element[1] + deltaY]);
    }); 
    return new Letter(translated_points);
};