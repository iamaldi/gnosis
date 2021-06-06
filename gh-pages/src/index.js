var DATASET_URL = "./data/dataset.json";
var MAXRESULTS = 25;

var gnosis = {
    oldColor: '',
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
    searchKB: function (match, dataset) {
        results = [];

        words = match.toLowerCase(); // tokenize?
        words = words.split(' ');
        regex = '';
        // Lazy way to create regex (?=.*word1)(?=.*word2) this matches all words.
        // regex infinite recursion?
        for (i = 0; i < words.length; i++) {
            regex += '(?=.*' + words[i] + ')';
        }

        dataset.forEach(e => {
            // get tokenized value of element instead
            var content = e.title.toLowerCase() + e.description.toLowerCase() + e.impact.toLowerCase() + e.mitigation.toLowerCase();
            if (content.match(regex)) { results.push(e); }
            ;
        });
        return results;
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
    gnosisSearchBar = document.querySelector('.gnosis-search-bar');

    function doSearch(event) {
        var searchTerm = gnosisSearchBar.value;

        if (searchTerm != '') {
            // controls.displayResults();
            // currentSet = window.dataset;
            // oldSearchValue = val;

            // check if dataset is valid

            console.log(searchTerm);
            let res = window.gnosis.searchKB(searchTerm, window.dataset);
            console.log(JSON.stringify(res));

            // window.controls.updateResults(resultsTable, currentSet);
        } else {
            // controls.hideResults();
            // noResults.style.display = 'none';
            // currentSet = window.dataset;

            // hide any visible results
        }
    }

    await fetch('./data/dataset.json')
        .then((res) => {
            if (res.ok) { return res.json(); } else {
                // set dataset to empty
                window.dataset = [];
                // handle error - show it in the UI
                console.log("[Error] Could not load dataset.");
            }
        })
        .then(data => {
            // window.dataset = data;
            // currentSet = window.dataset;
            // window.controls.updateResults(resultsTable, window.dataset);
            // doSearch({ type: 'none' });
            console.log(data);
            window.dataset = data;
        });

    gnosisSearchBar.addEventListener("input", doSearch);
});