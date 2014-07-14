var data = [{
    'name': 'ELEC 220', 
    'prerequisites': '', 
}, {
    'name': 'COMP 140', 
    'prerequisites': '', 
}, {
    'name': 'COMP 182', 
    'prerequisites': 'COMP 140', 
}, {
    'name': 'COMP 215', 
    'prerequisites': 'COMP 182', 
}, {
    'name': 'COMP 221', 
    'prerequisites': 'ELEC 220 AND COMP 215', 
}, {
    'name': 'COMP 310', 
    'prerequisites': 'COMP 215', 
}, {
    'name': 'COMP 322', 
    'prerequisites': 'COMP 215', 
}, {
    'name': 'COMP 421', 
    'prerequisites': 'COMP 221', 
}];

function main() {
    var that = this;
    var w = 1000;
    var h = 1000;
    var r = 40;
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h); 

    this.levels = {};
    this.lines = [];
    this.courses = [];
    this.courseDict = {};

    // populate courses from database
    this.init = function() {
        for (var i = 0; i < data.length; i++)
            if (!(data[i] in this.courseDict))
                this.addCourse(data[i]);
        this.visualize();
    };

    this.shave = function(lines) {
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            var theta = Math.atan(l.m);
            var mult = l.x1 > l.x2 ? -1 : 1
            l.x1 += r * Math.cos(theta) * mult;
            l.y1 += r * Math.sin(theta) * mult;
            l.x2 -= r * Math.cos(theta) * mult;
            l.y2 -= r * Math.sin(theta) * mult;
        };
    };

    this.splitPrereqs = function(prereqs) {
        // TODO: evaluate parentheses
        // probably best to return "TOO MANY" if mor than one set of ()
        if (prereqs === '')
            return [];
        return prereqs.split(/ AND | OR /);
    };

    this.getLevel = function(course) {
        // prelim check for course level
        if ('level' in course)
            return course.level;
        else if (course.prerequisites === '') 
            return 0;

        // recursively add prereqs and find their levels
        var prereqs = this.splitPrereqs(course.prerequisites)
        var max = 0;
        for (var i = 0; i < prereqs.length; i++) {
            if (!(prereqs[i] in this.courseDict))
                this.addCourse(prereqs[i]);
            var c = this.courseDict[prereqs[i]];
            var curr = c.level + 1; // addCourse automatically determines prereq lvl
            max = curr > max ? curr : max;
        };
        return max;
    };

    this.checkLineCollision = function(line) {
        // TODO: return all collided objects, not just true
        // var collisions = {
        //     courses: [], 
        //     lines: []
        // };

        // first checks if line goes through any circle center
        for (var i = 0; i < this.courses.length; i++) {
            var c = this.courses[i];
            if (line.m * c.x + line.b === c.y && c.y > line.y1 && c.y < line.y2 &&
                ((c.x > line.x1 && c.x < line.x2) || (c.x < line.x1 && c.x > line.x2)))
                return true;
                // collisions.courses.push(c);
        };

        // then checks if any two lines overlap
        for (var j = 0; j < this.lines.length; j++) {
            var l = this.lines[j];
            if (line.m === l.m && line.b === l.b &&
                ((l.y1 > line.y1 && l.y1 < line.y2) || (l.y2 > line.y1 && l.y2 < line.y2)))
                return true;
                // collsions.lines.push(l);
        };

        return false;
        // return collisions;
    };

    this.addCourse = function(course) {
        // fill out how many courses per vertical level 
        course.lines = [];
        course.level = this.getLevel(course);
        if (!(course.level in this.levels)) 
            this.levels[course.level] = [];
        course.y = 2.5 * course.level * r + 50;

        // if no prereqs (ie, base course)
        if (course.prerequisites === '') {
            course.pos = this.levels[0].length;
            course.x = 2.5 * course.pos * r + 50;
            this.courses.push(course);
            this.courseDict[course.name] = course;
            this.levels[0].push(course.pos);
            return;
        };

        // draw lines from prereqs to course
        var coursePrereqs = this.splitPrereqs(course.prerequisites);
        for (var i = 0; i < coursePrereqs.length; i++) {
            var prereq = coursePrereqs[i];
            var line = {
                'x1': this.courseDict[prereq].x, 
                'y1': this.courseDict[prereq].y, 
                'y2': course.y, 
                'from': this.courseDict[prereq], 
                'to': course
            };
            course.lines.push(line);
        };

        // increment x position until overlap is gone
        course.pos = -1;
        do {
            var badPos = false;
            course.pos++;
            course.x = 2.5 * course.pos * r + 50;
            for (var i = 0; i < course.lines.length; i++) {
                var line = course.lines[i];
                line.x2 = course.x;
                line.m = (line.y2 - line.y1) / (line.x2 - line.x1); // may be infinity
                line.b = (line.y1 - line.m * line.x1); // in which case this would be -infinity
                // if pos occupied or if pos causes collision
                if (this.levels[course.level].indexOf(course.pos) >= 0 || this.checkLineCollision(line)) {
                    badPos = true;
                    break;
                };
            };
        } while (badPos);
        
        // add course information to globals
        this.shave(course.lines);
        this.courses.push(course);
        this.courseDict[course.name] = course;
        this.levels[course.level].push(course.pos);
        this.lines = this.lines.concat(course.lines);
    };

    this.visualize = function() {
        svg.selectAll("circle")
            .data(this.courses)
            .enter()
            .append("circle")
            .attr("r", r)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("fill", function(d) { return "rgb(" + (d.level * 50) + ", 0, 0)"; })
            .attr("name", function(d) { return d.name; });

        svg.selectAll("line")
            .data(this.lines)
            .enter()
            .append("line")
            .attr("x1", function(d) { return d.x1; })
            .attr("y1", function(d) { return d.y1; })
            .attr("x2", function(d) { return d.x2; })
            .attr("y2", function(d) { return d.y2; });

        svg.selectAll("text")
            .data(this.courses)
            .enter()
            .append("text")
            .text(function(d) { return d.name; })
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y + 5; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");
    };
};

var m = new main();
m.init();