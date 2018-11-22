/*global updateCount x*/

/**
 * User interface connection to the simulation.
 * @constructor
 */
function Controller(particles) {
    this.particles = particles;
    this.init();
    this.mousedown = false;

    var _this = this,
        canvas = particles.igloo.gl.canvas;
    $(canvas).on('mousemove', function(event) {
        // TODO(aditi): define event
    });
    $(canvas).on('mouseout', function() {
        // TODO(aditi): define event
    });
    $(canvas).on('mousedown', function() {
        // TODO(aditi): define event
    });
    $(canvas).on('mouseup', function(event) {
        // TODO(aditi): define event
    });
    $(window).on('keyup', function(event) {
        switch (event.which) {
        case 67: // c
            _this.clear();
            break;
        case 68: // d
            _this.adjust(2);
            break;
        case 72: // h
            _this.adjust(0.5);
            break;
        }
    });
    this.controls = {
        increase: $('.controls .increase').on('click', function() {
            _this.adjust(2);
        }),
        decrease: $('.controls .decrease').on('click', function() {
            _this.adjust(0.5);
        }),
        pcolor: $('.controls .particles .color').on('change', function(event) {
            var value = $(event.target).val();
            _this.particles.color = Controller.parseColor(value);
        }),
        reset: $('.controls .reset').on('click', function() {
            _this.adjust(1);
        }),
        psize: $('.controls .particles .size').on('input', function() {
            _this.particles.size = Number($(this).val());
        }),
        clear: $('.controls .clear').on('click', function() {
            _this.clear();
        }),
        save: $('.controls .save').on('click', function() {
            localStorage.snapshot = JSON.stringify(_this.save());
        }),
        restore: $('.controls .restore').on('click', function() {
            _this.restore(JSON.parse(localStorage.snapshot));
            updateCount();
        })
    };
}

/**
 * Create and capture the mouse obstacle.
 * @returns {Controller} this
 */
Controller.prototype.init = function() {
    // TODO(aditi): set initial state 
    return this;
};

/**
 * Immediately adjust the particle count.
 * @param {number} factor multiplies the particle count
 * @returns {Controller} this
 */
Controller.prototype.adjust = function(factor) {
    var current = this.particles.getCount();
    this.particles.setCount(Math.max(1, current * factor));
    updateCount();
};

/**
 * Captures the simulation's particle count and obstacle configuration.
 * @returns {Object} the simulation save state object
 */
Controller.prototype.save = function() {
    var save = {
        size: this.particles.size,
        particles: this.particles.getCount(),
    };
    return save;
};

/**
 * Restore the simulation's state from a save object.
 * @param {Object} save
 * @returns {Controller} this
 */
Controller.prototype.restore = function(save) {
    if (this.particles.getCount() !== save.particles) {
        this.particles.setCount(save.particles);
    }
    this.clear();
    var ps = this.particles;
    this.controls.psize.val(ps.size = save.size);
    return this;
};

/**
 * @param {Object} event
 * @returns {Array} the simulation coodinates from the event
 */
Controller.coords = function(event) {
    var $target = $(event.target),
        offset = $target.offset(),
        border = 1,
        x = event.pageX - offset.left - border,
        y = $target.height() - (event.pageY - offset.top - border);
    return [x, y];
};

/**
 * @param {Array|ArrayBufferView|value} value
 * @param {number} [precision=4]
 * @returns {Array|number} a copy of the array/value rounded to PRECISION
 */
Controller.round = function(value, precision) {
    precision = precision || 4;
    if ('length' in value) {
        return Array.prototype.map.call(value, function (x) {
            return Number(x.toPrecision(precision));
        });
    } else {
        return Number(value.toPrecision(precision));
    }
};

/**
 * @param {string} color
 * @returns {Array} a 4-element color array
 */
Controller.parseColor = function(color) {
    var colors = /#(..)(..)(..)/.exec(color).slice(1).map(function(x) {
        return parseInt(x, 16) / 255;
    });
    colors.push(1);
    return colors;
};
