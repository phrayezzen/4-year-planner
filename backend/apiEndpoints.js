var http = require('http'),
	db = require('mongojs').connect("4-year-planner", ["courses"]),
	url = require("url"),
	fs = require("fs");
var extToMime = {
	js: "text/javascript",
	html: "text/html",
}

http.createServer(requestHandler).listen(2205);
console.log("server running at http://localhost:2205/");

function requestHandler(req, res) {
	var u = url.parse(req.url).pathname.split("/");

	if (u[1] === 'courses') {
		res.writeHead(200, {"Content-Type": "application/json"});
		db.courses.find(u[2] === undefined ? null : {name: u[2]}, function(err, data) {
			if (err) {
				console.log("There was an error executing the database query.");
				res.end();
				return;
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	}

	else {
		if (u[1] === '')
			u[1] = 'index.html';
		fs.readFile(".." + u.join("/"), "binary", function(err, file) {
			if (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write(err + "\n");
				res.end()
				return;
			}
			fileExt = u[u.length - 1].split(".");
			res.writeHead(200, 
				{"Content-Type": extToMime[fileExt[fileExt.length - 1]]});
			res.write(file, "binary");
			res.end()
		})
	} 
}