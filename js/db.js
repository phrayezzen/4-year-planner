var databaseUrl = "planner";
var collections = ["users", "classes"];
var db = require("mongojs").connect(databaseUrl, collections);
