
// var data = [{
//     'name': 'COMP140', 
//     'prerequisites': '', 
// }, {
//     'name': 'ELEC220', 
//     'prerequisites': '', 
// }, {
//     'name': 'COMP182', 
//     'prerequisites': 'COMP140', 
// }, {
//     'name': 'COMP215', 
//     'prerequisites': 'COMP182', 
// }, {
//     'name': 'COMP221', 
//     'prerequisites': 'ELEC220 AND COMP215', 
// }, {
//     'name': 'COMP310', 
//     'prerequisites': 'COMP215', 
// }, {
//     'name': 'COMP322', 
//     'prerequisites': 'COMP215', 
// }, {
//     'name': 'COMP421', 
//     'prerequisites': 'COMP221', 
// }];

function main() {
    var that = this;
    var w = 1000;
    var h = 1000;
    var r = 40;
    this.svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h); 

    this.levels = {};
    this.courseDict = {};

    this.apiRequest = function(course) {
        course = course ? "/" + course : "";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", 'http://localhost:2205/courses' + course, false);
        xmlHttp.send(null);
        return JSON.parse(xmlHttp.responseText);
    }

    this.shaveLines = function(lines) {
        var to = Object.keys(lines);
        for (var i = 0; i < to.length; i++) {
            var l = lines[to];
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

    this.getAllPrereqs = function(course) {
        course = this.courseDict[course];
        var prereqs = this.splitPrereqs(course.prerequisites);
        var l = prereqs.length;
        for (var i = 0; i < l; i++) {
            prereqs = prereqs.concat(this.getAllPrereqs(prereqs[i]));
        };
        return prereqs;
    }

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

    this.getCourse = function(course) {
        if (course === undefined) {
            course = $("#addCourse").val();
        }
        this.addCourse(course);
        this.visualize();
    };

    this.checkLineCollision = function(line) {
        // TODO: return all collided objects, not just true
        // var collisions = {
        //     courses: [], 
        //     lines: []
        // };

        // first checks if line goes through any circle center
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (line.m * c.x + line.b === c.y && c.y > line.y1 && c.y < line.y2 &&
                ((c.x > line.x1 && c.x < line.x2) || (c.x < line.x1 && c.x > line.x2)))
                return true;
                // collisions.courses.push(c);
            // then checks if any two lines overlap
            var to = Object.keys(c.lines)
            for (var j = 0; j < to.length; j++) {
                var l = c.lines[to[j]];
                if (line === l)
                    continue
                if (line.m === l.m && line.b === l.b &&
                    ((l.y1 > line.y1 && l.y1 < line.y2) || (l.y2 > line.y1 && l.y2 < line.y2)))
                    return true;
                    // collsions.lines.push(l);
            };
        };

        return false;
        // return collisions;
    };

    this.addCourse = function(course) {
        console.log(course);
        if (course in this.courseDict) {
            error("Course already added!");
            return;
        }
        if (course === '') {
            error("Please enter a course!");
            return;
        }
        course = this.apiRequest(course)[0];
        if (course === undefined) {
            error("Course not found!");
            return;
        }
        // fill out course definites
        course.lines = {};
        course.level = this.getLevel(course);
        if (!(course.level in this.levels)) 
            this.levels[course.level] = [];
        course.y = 2.5 * course.level * r + 50;

        // if no prereqs (ie, base course)
        if (course.prerequisites === '') {
            course.pos = this.levels[0].length;
            course.x = 2.5 * course.pos * r + 50;
            data.push(course);
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
                'from': prereq,
                'to': course.name
            };
            this.courseDict[prereq].lines[course.name] = line;
        };

        // increment x position until overlap is gone
        course.pos = -1;
        do {
            console.log(course.name, course.pos);
            var badPos = false;
            course.pos++;
            course.x = 2.5 * course.pos * r + 50;
            for (var i = 0; i < coursePrereqs.length; i++) {
                var line = this.courseDict[coursePrereqs[i]].lines[course.name];
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
        // this.shaveLines(course.lines);
        data.push(course);
        this.courseDict[course.name] = course;
        this.levels[course.level].push(course.pos);
        return;
    };

    this.deleteCourse = function(course) {
        $("g." + course).remove();
        course = this.courseDict[course];
        this.levels[course.level].splice(this.levels[course.level].indexOf(course.pos), 1);
        var to = Object.keys(course.lines);
        for (var i = 0; i < to.length; i++) {
            if (to[i] in this.courseDict)
                this.deleteCourse(to[i]);
            // TODO: store FROM lines in course.lines as well as TO lines
            // actually unnecessary?
        }
        var prereqs = this.splitPrereqs(course.prerequisites);
        for (var i = 0; i < prereqs.length; i++) {
            var l = this.courseDict[prereqs[i]].lines[course.name];
            $('line.' + l.to).remove();
            delete l;
        }
        delete this.courseDict[course.name];
        data.splice(data.indexOf(course), 1);
        // TODO: rearrange courses
    };

    this.visualize = function() {
        $("svg").children().remove()

        var circlesAndLines = this.svg.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("class", function(d) { return d.name; });

        circlesAndLines.each(function(d) {
            var to = Object.keys(d.lines);
            for (var i = 0; i < to.length; i++) {
                var l = d.lines[to[i]];
                d3.select(this)
                    .append("line")
                    .attr("x1", l.x1)
                    .attr("y1", l.y1)
                    .attr("x2", l.x2)
                    .attr("y2", l.y2)
                    .attr("stroke-width", 2)
                    .attr("opacity", "0")
                    .attr("class", "line");
            }
        });

        var mouseOverAndOut = function(over, course) {
            // (un)highlight course and prereqs
            var highlightedCourses = m.getAllPrereqs(course);
            highlightedCourses.push(course);
            for (var i = 0; i < highlightedCourses.length; i++) {
                d3.select("#" + highlightedCourses[i])
                    .transition()
                    .duration(500)
                    .style("stroke", over ? function() {
                            return highlightedCourses[i] === course ? "aqua" : "lime";
                        } : "orange");
            }

            // show/hide lines
            d3.selectAll(".line")
                .transition()
                .duration(500)
                .attr("opacity", over ? "1" : "0");
        }

        var circles = circlesAndLines.append("g")
            .on("mouseover", function(d) { mouseOverAndOut(true, d.name); })
            .on("mouseout", function(d) { mouseOverAndOut(false, d.name); })
            .on("dblclick", function(d) {
                // kind of mouseout the circle
                mouseOverAndOut(false, d.name);
                // DELETED
                m.deleteCourse(d.name);
            });

        circles.append("circle")
            .attr("r", r)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("fill", 'red')//function(d) { return "rgb(" + (d.level * 50) + ", 0, 0)"; })
            .attr("stroke", "orange")
            .attr("stroke-width", 5)
            .attr("id", function(d) { return d.name; });

        circles.append("text")
            .text(function(d) { return d.name; })
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y + 5; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");
    };
};

// $(document).ready(function () {
//     $("svg").on("mouseover", "circle", function(e) {
//         var course = $(this).attr("class");
//         var changes = m.getAllPrereqs(m.courseDict[course]);
//         changes.push(course);
//         for (var i = 0; i < changes.length; i++) {
//             m.svg.select("circle." + changes[i])
//                 .transition()
//                 .duration(500)
//                 .style("stroke", function(d) { return changes[i] === course ? "aqua" : "lime"});
//         };
//     }).on("mouseout", "circle", function() {
//         var course = $(this).attr("class");
//         var changes = m.getAllPrereqs(m.courseDict[course]);
//         changes.push(course);
//         for (var i = 0; i < changes.length; i++) {
//             m.svg.select("circle." + changes[i])
//                 .transition()
//                 .duration(500)
//                 .style("stroke", "orange");
//         };
//     }).on("dblclick", "circle", function(e) {
//         var course = $(this)[0].__data__.name;
//         var deleteLines = m.deleteCourse(course);
//         m.svg.selectAll("circle")
//             .transition()
//             .duration(500)
//             .style("stroke", "orange");
//         for (var i = 0; i < deleteLines.length; i++) {
//             $("line." + deleteLines[i].from.name).remove();
//             m.lines.splice(m.lines.indexOf(deleteLines[i]), 1);
//         }
//         // TODO: rearrange courses to fit better 
//         m.visualize();
//     }).on("mousedown", "circle", function(e) {
//         e.preventDefault(); // TODO: make doubleclick stop highlighting better
//     });
// });

var error = function(errMsg) {
    $("#err").text(errMsg).show().fadeOut(1500);
}

var m = new main();
var data = []
m.addCourse("COMP516"); m.visualize();
// var data = m.apiRequest();
// m.init();