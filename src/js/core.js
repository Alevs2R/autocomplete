require('../scss/core.scss');
import Dropdown from './dropdown';

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

function Autocomplete(elem, options) {
    this.options = extend(this.options, options);

    try {
        this.setInput(elem);
        this.setData(this.options.source);
    } catch (err){
        console.error(err);
        return;
    }

    this.dropdown = new Dropdown(this.input, this.options);

    this.dropdown.select = function(element){
        this.input.value = element[this.options.displayedProperty];
        this.selected = element;
        this._finishTyping();
    }.bind(this);

    this._bindInputEvents();

    this.handleEvent = function (e) {
        switch (e.type) {
            case "focus":
                this._onFocusEvent();
                break;
            case "input":
                this._search(this.input.value);
                break;
            case "keydown":
                this._keyDownEvent(e);
        }
    };

    this._finishTyping = this._finishTyping.bind(this);
}

Autocomplete.prototype = {
    options: _options,
    lastSearch: null,
    selected: undefined,

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
        if (typeof elem == 'string') this.input = document.querySelector(elem);
        else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;
        else throw '1 argument should be String or instance of Element with tagName input';
    },

    _bindInputEvents(){
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
        this.input.addEventListener("click", function(e){
            e.stopPropagation();
        });
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
            if(row[this.options.displayedProperty] == value) this.selected = row;

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
        this.selected = null;
        this.dropdown.showList(this._getSearchResult(value.trim()));
    },

    _validate(){
      if(!this.selected){
          this.input.className += ' error';
      }
    },

    _onFocusEvent(){
        document.body.addEventListener('click', this._finishTyping);
        this.input.className = 'autocomplete';

        if(!this.selected && this.lastSearch) this.dropdown.showList(this.lastSearch.result);
    },

    _finishTyping(){
        this.dropdown.remove();
        this._validate();
        document.body.removeEventListener('click', this._finishTyping);
    }

};