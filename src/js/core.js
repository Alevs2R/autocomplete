require('../scss/core.scss');

module.exports = AutocompleteFactory;

var console = window.console;

// extend objects
function extend(a, b) {
    for (var prop in b) {
        a[prop] = b[prop];
    }
    return a;
}

function AutocompleteFactory(elem, options) {

    if (typeof elem == 'string') {
        elem = document.querySelector(elem);
    }

    return new Autocomplete(elem, options);
}

var _options = {
    'source': null,
    'arrow': false,
    'numberOfRows': 5,
    'searchByEntry:': false,
    'idProperty': 'Id',
    'maxResults': 20,
    'displayedProperty': "City"
};

function Autocomplete(elem, options) {
    this.options = extend(this.options, options);

    if (typeof this.options.source == 'string') this._loadJSON(this.options.source).then((data) => this.data = data);
    else this.data = this.options.source;

    this.input = elem;
    this._bindEvents();

    this.handleEvent = function (e) {
        switch (e.type) {
            case "focus":
                //this._showDropdown();
                break;
            case "input":
                this._search(this.input.value);
                break;
        }
    }
}

Autocomplete.prototype = {
    options: _options,
    lastSearch: null,
    isDropdownCreated: false,
    _bindEvents(){
        this.input.addEventListener("focus", this, false);
        this.input.addEventListener("input", this, false);
    },
    _unBindEvents(){
    },
    _showDropdown(){
        this.isDropdownCreated = true;

        console.log('show dropdown');
        let elemRect = this.input.getBoundingClientRect();

        let dropdown = document.createElement('div');
        dropdown.className = "autocomplete-dropdown";

        this.elementsList = document.createElement('ul');
        dropdown.appendChild(this.elementsList);

        dropdown.style.left = elemRect.left;
        dropdown.style.top = elemRect.bottom + 3;

        this.input.parentNode.insertBefore(dropdown, this.input.nextSibling);
        this.dropdown = dropdown;
    },
    _loadJSON(url){
        console.log('asdasd');
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    },
    _getSearchResult(value){
        let searchData;
        if (this.lastSearch && value.startsWith(this.lastSearch.value)) {
            searchData = this.lastSearch.result;
        }
        else searchData = this.data;

        if (!this.data) return [];
        let result = [];
        for (let row of this.data) {
            for (let property in row) {
                if (row.hasOwnProperty(property) && String(row[property]).startsWith(value)) {
                    result.push(row);
                    break;
                }
            }
            if (result.length == this.options.maxResults) break;
        }

        this.lastSearch = {value, result};
        return result;
    },
    _search(value){
        this._showSearchResult(this._getSearchResult(value.trim()));
    },
    _removeDropdown(){
        if (!this.isDropdownCreated) return;
        this.dropdown.parentNode.removeChild(this.dropdown);
        this.isDropdownCreated = false;
        console.log('remove');
    },
    _showSearchResult(result){
        if (result.length == 0) {
            this._removeDropdown();
            return;
        }

        let list = '';
        for (row of result) {
            list += '<li>' + row[this.options.displayedProperty] + '</li>';
        }
        if (!this.isDropdownCreated) {
            this._showDropdown();
        }
        this.elementsList.innerHTML = list;

    },
    _selectElement(){
    },
};