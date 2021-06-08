import Fuse from './fuse.esm.js';
const ISSUES_DATASET_PATH = "./dataset/issues/issues.json";
const ISSUES_DATASET_INDEX_PATH = "./dataset/issues/fuse-index.json";
const MAX_RESULTS = 25;

var resultTableItem = '<tr class="OuterTr"><td colspan="2">$resultDetails</td></tr>';
var titleAndDescriptionTable = '<table class="InsideTable"><tr><td><p>$title</p></td><td><p>$description</p></td></tr></table>';
var impactTable = '<table class="ExtraInsideTable Hidden"><div class="UnderLine Hidden"></div><tr><td><p>Impact</p></td><td><p>$impact</p></td></tr></table>';
var mitigationTable = '<table class="ExtraInsideTable Hidden"><tr><td>Mitigation</td><td>$mitigation</td></tr></table>';
var referenceTable = '<table class="ExtraInsideTable References Hidden"><tr><td>References</td><td>$referenceItems</td></tr></table></td>'
var referenceItem = '<a href="$referenceURL" target="_blank">$referenceURL</a>';
var dropdown = '<div class="Dropdown"><p onclick="window.gnosis.expandDetails(this)">X</p></div>';

var gnosis = {
    updateResultsCounter(show, totalResults) {
        var resultsDiv = document.querySelector(".Results");
        var resultsCounter = resultsDiv.querySelectorAll("p")[1];
        if (show) {
            resultsCounter.textContent = totalResults;
            resultsDiv.style.display = "flex";
        } else {
            resultsDiv.style.display = "none";
        }
    },
    expandDetails(resultElement) {
        var horizontalLine = resultElement.querySelector(".UnderLine");
        var horizontalLineComputedStyle = window.getComputedStyle(horizontalLine);
        var resultElementChildren = resultElement.querySelectorAll(".ExtraInsideTable");

        if (horizontalLineComputedStyle.display === "none") {
            horizontalLine.style.display = "block";
        } else {
            return;
        }

        var i;
        for (i = 0; i < resultElementChildren.length; i++) {
            var currentStyle = window.getComputedStyle(resultElementChildren[i]);
            if (currentStyle.display == "none") {
                resultElementChildren[i].style.display = "table";
            } else {
                resultElementChildren[i].style.display = "none"
            }
        }
    },
    collapseDetails(resultElement) {
        var test = resultElement.parentElement.parentElement;
        var aa = test.getElementsByTagName("tr")[0];
        console.log(aa);
    },
    displayResults(resultsTable, results) {
        var resultTitleAndDescriptionElem;
        var impactTableElem;
        var mitigationTableElem;
        var references;
        var resultItemElem;
        var referenceItemElem;
        var referenceItemsElem = [];
        var referenceTableElem;
        var resultDetailsElem;

        results.forEach(result => {
            // fill in the result details
            resultTitleAndDescriptionElem = titleAndDescriptionTable
                .replace('$title', result.item.title)
                .replace("$description", result.item.description);

            impactTableElem = impactTable
                .replace("$impact", result.item.impact);

            mitigationTableElem = mitigationTable
                .replace("$mitigation", result.item.mitigation);

            references = result.item.references;

            if (references.length > 0) {
                references.forEach(reference => {
                    referenceItemElem = referenceItem.replaceAll("$referenceURL", reference);
                    referenceItemsElem.push(referenceItemElem);
                })
                referenceTableElem = referenceTable.replace("$referenceItems", referenceItemsElem.join(""));
            } else {
                // add an N/A to the references
                referenceTableElem = referenceTable.replace("$referenceItems", "N/A");
            }

            // add result to table
            resultDetailsElem = resultTitleAndDescriptionElem + dropdown + impactTableElem + mitigationTableElem + referenceTableElem;
            resultItemElem = resultTableItem.replace("$resultDetails", resultDetailsElem);
            resultsTable.innerHTML += resultItemElem;
        });
    }
};

window.gnosis = gnosis;

document.addEventListener('DOMContentLoaded', async () => {
    var resultsTable = document.querySelector(".OuterTable");
    var resultsTableBody = resultsTable.getElementsByTagName("tbody")[0];
    var gnosisSearchBar = document.querySelector('.gnosis-search-bar');
    gnosisSearchBar.focus();

    await fetch(ISSUES_DATASET_PATH)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log("[Error] Could not get dataset.")
            }
        }).then(dataset => {
            // TODO find fine-tuned options
            const options = {
                isCaseSensitive: false,
                minMatchCharLength: 2,
                threshold: 0.2,
                shouldSort: true,
                includeScore: true,
                keys: ['title', 'description', 'impact', 'mitigation', 'references']
            }
            // Create the Fuse index
            const myIndex = Fuse.createIndex(options.keys, dataset)
            // dataset loaded, create Fuse instance in the 'tokens' parameter
            window.fuse = new Fuse(dataset, options, myIndex);
        });

    async function doSearch() {
        var searchTerm = gnosisSearchBar.value;
        resultsTableBody.innerHTML = '';
        resultsTable.style.display = "none";

        if (searchTerm != '') {
            var results = window.fuse.search(searchTerm);
            // show and update the results counter
            window.gnosis.updateResultsCounter(true, results.length);

            if (results.length == 0) {
                // show no results error
            } else {
                // display results
                resultsTable.style.display = "table";
                window.gnosis.displayResults(resultsTableBody, results);
            }
        } else {
            // hide the visible results counter
            window.gnosis.updateResultsCounter(false, 0);

            // make results table empty
        }
    }

    gnosisSearchBar.addEventListener("input", doSearch);
});