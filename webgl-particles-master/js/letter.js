function Letter(points){
    this.points = points;
};

Letter.prototype.numPoints = function() {
    return this.points.length; 
};

Letter.prototype.getRandomPoint = function() {
    return this.points[Math.floor(Math.random() * this.numPoints())];
};

Letter.prototype.translated = function(deltaX, deltaY) {
    translated_points = []
    this.points.forEach(element => {
        translated_points.push([element[0] + deltaX, element[1] + deltaY]);
    }); 
    return new Letter(translated_points);
};