var data = [{
    name: 'COMP140', 
    prerequisites: '', 
}, {
    name: 'ELEC220', 
    prerequisites: '', 
}, {
    name: 'COMP182', 
    prerequisites: 'COMP140', 
}, {
    name: 'COMP215', 
    prerequisites: 'COMP182', 
}, {
    name: 'COMP221', 
    prerequisites: 'COMP215 AND ELEC220', 
}, {
    name: 'COMP310', 
    prerequisites: 'COMP215', 
}, {
    name: 'COMP322', 
    prerequisites: 'COMP215', 
}, {
    name: 'COMP421', 
    prerequisites: 'COMP221', 
}, {
    name: 'COMP160', 
    prerequisites: '', 
}, {
    name: 'COMP481', 
    prerequisites: '', 
}, {
    name: 'COMP482', 
    prerequisites: 'COMP182', 
}, {
    name: 'COMP411', 
    prerequisites: 'COMP310', 
}, {
    name: 'COMP412', 
    prerequisites: 'COMP215 AND COMP221 AND COMP310', 
}, {
    name: 'COMP409', 
    prerequisites: 'COMP182 AND COMP215', 
}, {
    name: 'COMP430', 
    prerequisites: 'COMP182 AND COMP221', 
}, {
    name: 'STAT310',
    prerequisites: ""
}, {
    name: 'COMP482',
    prerequisites: "STAT310 AND COMP182"
}, {
    name: 'COMP413',
    prerequisites: "COMP421"
}, {
    name: 'COMP516',
    prerequisites: "COMP413 AND COMP221 AND COMP420"
}, {
    name: 'COMP420',
    prerequisites: "COMP421"
}];

db = db.getSiblingDB('4-year-planner');
for (var i = 0; i < data.length; i++) {
    db.courses.update({ name: data[i].name }, data[i], { upsert: true });
}
