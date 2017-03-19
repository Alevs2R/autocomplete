function isValidElement(el) {
    let words = el["City"].split(" ");
    let valid = false;
    for (word of words) {
        let ch = word.charAt(0);
        if (ch < '0' || ch > '9') {
            if (ch == ch.toUpperCase()) {
                valid = true;
                break;
            }
        }
    }

    return valid;
}

var options = {
    source: 'kladr.json',
    displayedProperty: 'City',
    sort: true,
    isValidElement,
    showNumOfResults: true,
    wordEndings: ['города','городов'],
    maxResults: 5
};

Autocomplete('.autocomplete', options);

options.searchByEntry = true;
Autocomplete('#searchByEntry', options);