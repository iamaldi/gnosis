var md = require('markdown-it')();
var fs = require('fs');
var path = require('path');

const DATASET_PATH = "/gh-pages/data/dataset.json";
const CONTENT_PATH = "/content/";

var file = "test.md";
var dataset = [];

function tokenize(str) {
    var tokenizedArr = str.toLowerCase().split(" ");
    return [...new Set(tokenizedArr)];
}

var tmp = {
    tokens: "",
    title: "",
    description: "",
    impact: "",
    mitigation: "",
    references: []
};


function addToJSON(dataArray) {
    var tmp1 = tmp;
    tmp1.tokens = tokenize(dataArray[0] + " " + dataArray[1] + " " + dataArray[2] + " " + dataArray[3]);
    tmp1.title = dataArray[0];
    tmp1.description = dataArray[1];
    tmp1.impact = dataArray[2];
    tmp1.mitigation = dataArray[3];

    tmp1.references = [dataArray[4], dataArray[5]];
    dataset.push(tmp1); // add to dataset
}



// parses data from table row
function extractRowData(row, offset) {
    var tmpData = [];
    for (i = offset; i < row.length; i++) {
        if (row[i].type === 'tr_close') {
            // console.log(row[i])
            // row content is consumed, call util function to add it to dataset
            filtered = tmpData.filter(String);
            addToJSON(filtered);
            return i;
        }
        tmpData.push(row[i].content);
    }
}

// parses table data from table
function extractTableData(tokens, offset) {
    var data = [];
    // Start at whatever the offset + 20 in order to skip the table headers and start consuming each row
    for (i = offset + 20; i < tokens.length; i++) {
        if (tokens[i].type === 'inline') {
            console.log(tokens[i]);
            i = extractRowData(tokens, i);
        } else if (tokens[i].type === 'table_close') {
            // table parsed
            return i;
        }
    }
}

function doIt(data) {
    var result = md.parse(data.toString());
    // start with i=0, technically starting at the first row with content
    for (i = 0; i < result.length; i++) {
        // find where the markdown table starts and ends
        if (result[i].type === 'table_open') {
            //start table processing
            i = extractTableData(result, i)
        }
    }
}



var results = [];

var walk = function (dir, done) {
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};
walk(__dirname + CONTENT_PATH, function (err, results) {
    if (err) throw err;
    results = ([...new Set(results)]);
});

// // read all markdown files inside content dir
for (i = 0; i < results.length; i++) {
    a(results[i])
    console.log(1)
}

fs.readFile("test.md", 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    doIt(data);
    console.log(dataset);
})

// writeFile(__dirname + DATASET_PATH, JSON.stringify(dataset, null, 4), 'utf8')

// write data to disk
// fs.writeFile(__dirname + DATASET_PATH, JSON.stringify(dataset, null, 4), 'utf8', (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("[Info] Dataset writen to disk.");
// });







