$(document).ready(function () {
	$("circle").hover(function() {
		var course = $(this).attr("id");
		var changes = m.getAllPrereqs(m.courseDict[course]);
		changes.push(course);
		for (var i = 0; i < changes.length; i++) {
			m.svg.select("#" + changes[i])
				.transition()
				.duration(500)
				.style("stroke", function(d) { return changes[i] === course ? "blue" : "green"});
		};
	}, function() {
		var course = $(this).attr("id");
		var changes = m.getAllPrereqs(m.courseDict[course]);
		changes.push(course);
		for (var i = 0; i < changes.length; i++) {
			m.svg.select("#" + changes[i])
				.transition()
				.duration(500)
				.style("stroke", "orange");
		};
	});
});