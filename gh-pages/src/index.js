import Fuse from './fuse.esm.js';
const ISSUES_DATASET_PATH = "./dataset/issues/issues.json";
const ISSUES_DATASET_INDEX_PATH = "./dataset/issues/fuse-index.json";
const MAX_RESULTS = 25;

var gnosis = {
    displayResults: function () {
        if (results.style) {
            results.style.display = '';
        }
        resultsTableHideable.classList.remove('hide');
    },
    hideResults: function () {
        if (results.style) {
            results.style.display = 'none';
        }
        resultsTableHideable.classList.add('hide');
    },
    updateResults: function (loc, results) {
        if (results.length == 0) {
            noResults.style.display = '';
            noResults.textContent = 'No Results Found';

            resultsTableHideable.classList.add('hide');
        } else if (results.length > totalLimit) {
            noResults.style.display = '';
            resultsTableHideable.classList.add('hide');
            noResults.textContent = 'Error: ' + results.length + ' results were found, try being more specific';
            this.setColor(colorUpdate, 'too-many-results');
        } else {
            var tableRows = loc.getElementsByTagName('tr');
            for (var x = tableRows.length - 1; x >= 0; x--) {
                loc.removeChild(tableRows[x]);
            }

            noResults.style.display = 'none';
            resultsTableHideable.classList.remove('hide');

            results.forEach(r => {
                //Not the fastest but it makes for easier to read code :>

                if (r.academy) {
                    el = searchResultFormat
                        .replace('$machine', r.machine)
                        .replace('$line', r.line)
                        .replace('$link', linkTemplateAcademy.replace('$course', r.academy));

                } else {
                    timeInSeconds = r.timestamp.minutes * 60 + r.timestamp.seconds;
                    el = searchResultFormat
                        .replace('$machine', r.machine)
                        .replace('$line', r.line)
                        .replace('$link', linkTemplate.replace('$video', r.videoId).replace('$time', timeInSeconds));
                };

                var wrapper = document.createElement('table');
                wrapper.innerHTML = el;
                var div = wrapper.querySelector('tr');

                loc.appendChild(div);
            });
        }
    }
};

window.gnosis = gnosis;

document.addEventListener('DOMContentLoaded', async () => {
    var gnosisSearchBar = document.querySelector('.gnosis-search-bar');

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
                keys: ['title', 'description']
            }
            // Create the Fuse index
            const myIndex = Fuse.createIndex(options.keys, dataset)
            // dataset loaded, create Fuse instance in the 'tokens' parameter
            window.fuse = new Fuse(dataset, options, myIndex);
        });

    async function doSearch() {
        var searchTerm = gnosisSearchBar.value;

        if (searchTerm != '') {
            var results = window.fuse.search(searchTerm);
            console.log(JSON.stringify(results));
            console.log(results.length)

            // Update results
            // window.controls.updateResults(resultsTable, currentSet);
        } else {
            // hide any visible results
        }
    }

    gnosisSearchBar.addEventListener("input", doSearch);
});