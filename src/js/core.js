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
    'minHeight': 200,
    'maxHeight': 450,
    'displayedProperty': "City",
    'dropdownPosition': "top",
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
    _createDropdown(){
        this.isDropdownCreated = true;

        let dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.visibility = 'hidden';

        this.elementsList = document.createElement('ul');
        dropdown.appendChild(this.elementsList);
        document.body.appendChild(dropdown);
        this.dropdown = dropdown;
    },
    _getDropdownHeight(availableSpace){
        return Math.min(Math.max(this.options.minHeight, availableSpace), this.options.maxHeight);
    },

    getCoords(elem) { // crossbrowser version
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return {top: Math.round(top), bottom: Math.round(top) + elem.offsetHeight, left: Math.round(left)};
    },

    _showDropdown(){
        const OFFSET_INPUT = 2;
        const WIDTH_INCREASE = 30;
        let coords = this.getCoords(this.input);
        let offsetBottom = document.body.clientHeight - coords.bottom;

        if (this.options.dropdownPosition == 'top' || (this.options.dropdownPosition == 'auto' && offsetBottom < this.options.minHeight)) {
            this.dropdown.style.maxHeight = this._getDropdownHeight(coords.top - OFFSET_INPUT) + 'px';
            this.dropdown.style.bottom = document.body.clientHeight - coords.top + OFFSET_INPUT + 'px';
        }
        else {
            this.dropdown.style.top = (coords.top + this.input.offsetHeight + OFFSET_INPUT) + "px";
            this.dropdown.style.maxHeight = this._getDropdownHeight(offsetBottom - OFFSET_INPUT) + 'px';
        }
        let maxWidth = document.body.clientWidth - coords.left;

        this.dropdown.style.left = coords.left + 'px';
        this.dropdown.style.maxWidth = maxWidth + 'px';
        this.dropdown.style.minWidth = Math.min(this.input.offsetWidth + WIDTH_INCREASE, maxWidth) + 'px';
        this.dropdown.style.visibility = 'visible';

        //TODO reaction on window resize
    },
    _loadJSON(url){
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
            this._createDropdown();
            this.elementsList.innerHTML = list;
            this._showDropdown();

        }
        else this.elementsList.innerHTML = list;
    },
    _selectElement(){
    },
};