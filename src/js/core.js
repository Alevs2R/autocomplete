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
    return new Autocomplete(elem, options);
}

const _options = {
    'source': null,
    'arrow': false,
    'minResults': 5,
    'maxResults': 20,
    'minHeight': 200,
    'maxHeight': 450,
    'displayedProperty': "value",
    'dropdownPosition': "auto",
};

const keynumCodes = {
    UP: 38,
    DOWN: 40,
    ENTER: 13
};

function Autocomplete(elem, options) {
    this.options = extend(this.options, options);

    try {
        this.setInput(elem);
        this.setData(this.options.source);
    } catch (err){
        console.error(err);
        return;
    }

    this._bindEvents();

    this.handleEvent = function (e) {
        switch (e.type) {
            case "focus":
                //this._showDropdown();
                break;
            case "input":
                this._search(this.input.value);
                break;
            case "keydown":
                this._keyDownEvent(e);
        }
    };

    this._removeDropdown = this._removeDropdown.bind(this);
}

Autocomplete.prototype = {
    options: _options,
    lastSearch: null,
    isDropdownCreated: false,
    selected: undefined,
    activeElement: undefined,

    setData(source){
        if (typeof source == 'string') this._loadJSON(source).then(data => this.data = data).catch(err => console.error(err));
        else {
            if (!(source instanceof Array)) throw 'source should be instance of Array or String';
            if (typeof source[0] == 'string') {
                this.data = source.map(str => {value: str});
                this.options.displayedProperty = 'value';
            }
            else this.data = source;
        }
    },

    setInput(elem){
        console.log(elem);
        if (typeof elem == 'string') this.input = document.querySelector(elem);
        else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;
        else throw '1 argument should be String or instance of Element with tagName input';
    },

    _bindEvents(){
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
    },
    _unBindEvents(){
    },
    _createDropdown(){
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

        document.body.style.overflow = 'hidden';

        document.body.addEventListener('click', this._removeDropdown);
        document.addEventListener('keydown', this);


        this.isDropdownCreated = true;
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
        document.body.style.overflow = 'auto';
        document.body.removeEventListener('click', this._removeDropdown);

        this.isDropdownCreated = false;
    },

    _showSearchResult(result){
        if (result.length == 0) {
            this._removeDropdown();
            return;
        }

        if (!this.isDropdownCreated) {
            this._createDropdown();
        }

        this.elementsList.innerHTML = '';
        for (let row of result) {
            let li = document.createElement('li');
            li.appendChild(document.createTextNode( row[this.options.displayedProperty] ));
            li.addEventListener('click', this.clickEvent.bind(this));
            li.listRow = row;
            this.elementsList.appendChild(li);
        }

        this.setActiveElement(this.elementsList.firstChild);

        if (!this.isDropdownCreated) {
            this._showDropdown();
        }
    },

    clickEvent(event){
        this.input.value = event.target.innerHTML;
        this.selected = event.target.listRow;
        this._removeDropdown();
        event.stopPropagation();
    },

    setActiveElement(elem){
        if(this.activeElement) this.activeElement.className = '';
        elem.className = 'active';
        this.activeElement = elem;
    },

    _keyDownEvent(event){
        switch(event.keyCode){
            case keynumCodes.DOWN:
                if(!this.activeElement.nextSibling) return;
                this.setActiveElement(this.activeElement.nextSibling);
                break;
            case keynumCodes.UP:
                if(!this.activeElement.previousSibling) return;
                this.setActiveElement(this.activeElement.previousSibling);
                break;
            case keynumCodes.ENTER:
                this.input.value = this.activeElement.listRow[this.options.displayedProperty];
                this._removeDropdown();
                break;

        }
    }

};