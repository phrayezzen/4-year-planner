// $(document).ready(function () {
// 	$("svg").on("mouseover", "circle", function(e) {
// 		var course = $(this).attr("class");
// 		var changes = m.getAllPrereqs(m.courseDict[course]);
// 		changes.push(course);
// 		for (var i = 0; i < changes.length; i++) {
// 			m.svg.select("circle." + changes[i])
// 				.transition()
// 				.duration(500)
// 				.style("stroke", function(d) { return changes[i] === course ? "aqua" : "lime"});
// 		};
// 	}).on("mouseout", "circle", function() {
// 		var course = $(this).attr("class");
// 		var changes = m.getAllPrereqs(m.courseDict[course]);
// 		changes.push(course);
// 		for (var i = 0; i < changes.length; i++) {
// 			m.svg.select("circle." + changes[i])
// 				.transition()
// 				.duration(500)
// 				.style("stroke", "orange");
// 		};
// 	}).on("dblclick", "circle", function(e) {
// 		var course = $(this)[0].__data__.name;
// 		var deleteLines = m.deleteCourse(course);
// 		m.svg.selectAll("circle")
// 			.transition()
// 			.duration(500)
// 			.style("stroke", "orange");
//         for (var i = 0; i < deleteLines.length; i++) {
//         	$("line." + deleteLines[i].from.name).remove();
//             m.lines.splice(m.lines.indexOf(deleteLines[i]), 1);
//         }
//         // TODO: rearrange courses to fit better 
// 		m.visualize();
// 	}).on("mousedown", "circle", function(e) {
// 		e.preventDefault(); // TODO: make doubleclick stop highlighting better
// 	});
// });