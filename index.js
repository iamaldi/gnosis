const md = require('markdown-it')();
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

const ISSUES_DATASET_PATH = __dirname + "/docs/dataset/issues/issues.json";
const ISSUES_DATASET_INDEX_PATH = __dirname + "/docs/dataset/issues/fuse-index.json";
const CONTENT_PATH = __dirname + "/content/";

var dataset = [];
var test = [];

// tokenizing data here should helps with search time in the frontend
function tokenize(str) {
    var tokenizedArr = str.toLowerCase().split(" ");
    return [...new Set(tokenizedArr)];
}

function addIssueToDataset(rowData) {
    const issue = {
        title: rowData[0],
        description: rowData[1],
        impact: rowData[2],
        mitigation: rowData[3],
        references: [rowData[4], rowData[5]]
    };
    // add parsed issue to dataset
    dataset.push(issue);
}

function extractTableRowData(row, offset) {
    var rowData = [];
    var i;
    for (i = offset; i < row.length; i++) {
        // we reached the end of the table row
        if (row[i].type === 'tr_close') {
            // remove any unwanted spaces
            filtered = rowData.filter(String);
            // add it to the dataset
            addIssueToDataset(filtered);
            return i;
        }
        // there's more row data to consume
        rowData.push(row[i].content);
    }
}

function extractTableData(table, offset) {
    var i;
    // start at whatever the offset + 20 in order to skip the table headers
    for (i = offset + 20; i < table.length; i++) {
        // if this is a table row
        if (table[i].type === 'inline') {
            // start consuming it
            i = extractTableRowData(table, i); // when it returns move the index at the end of the row
        } else if (table[i].type === 'table_close') {
            // we consumed the whole table
            return i;
        }
    }
}

function extractIssuesData(markdownData) {
    var i;
    var parsedMarkdownData = md.parse(markdownData.toString());
    // start with i=0, technically starting at the first row with content
    for (i = 0; i < parsedMarkdownData.length; i++) {
        // this is the start of the markdown table
        if (parsedMarkdownData[i].type === 'table_open') {
            // start table processing
            i = extractTableData(parsedMarkdownData, i)
        }
    }
}

// Recursive directory search- https://stackoverflow.com/a/5827895
var findMdFilesInDirRecursive = (dir, done) => {
    var results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    findMdFilesInDirRecursive(file, (err, res) => {
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

function writeDatasetToDisk(dataset, datasetDestinationPath) {
    fs.writeFileSync(datasetDestinationPath, JSON.stringify(dataset, null, 4), 'utf8');
}

function createFuseIndexAndWriteToDisk(dataset, indexDestinationPath) {
    // Create Fuse index
    const options = { keys: ['title', 'description', 'impact', 'mitigation', 'references'] };
    const myIndex = Fuse.createIndex(options.keys, dataset);

    fs.writeFileSync(indexDestinationPath, JSON.stringify(myIndex.toJSON()), 'utf8')
}

function prepareIssuesDataset(files) {
    var i;
    for (i = 0; i < files.length; i++) {
        // read file contents
        var markdownData = fs.readFileSync(files[i], 'utf8');
        extractIssuesData(markdownData);
    }
}

findMdFilesInDirRecursive(CONTENT_PATH, (err, results) => {
    if (err) {
        console.log("[findMdFilesInDirRecursive] Error, could not read directory files.");
    }
    var files = ([...new Set(results)]);

    console.log("[prepareIssuesDataset] Initializing issues dataset processing.");
    prepareIssuesDataset(files);

    console.log("[writeDatasetToDisk] Writing dataset to disk.");
    writeDatasetToDisk(dataset, ISSUES_DATASET_PATH);

    console.log("[createFuseIndexAndWriteToDisk] Creating and writing Fuse index to disk.");
    createFuseIndexAndWriteToDisk(dataset, ISSUES_DATASET_INDEX_PATH);
});