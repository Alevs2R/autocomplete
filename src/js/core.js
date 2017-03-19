require('../scss/core.scss');
import Dropdown from "./dropdown";

module.exports = AutocompleteFactory;

// extend objects
function extend(s, b) {
    var a = {};
    Object.assign(a, s);
    for (var prop in b) {
        a[prop] = b[prop];
    }
    return a;
}

function AutocompleteFactory(elem, options) {
    return new Autocomplete(elem, options);
}

const defaultOptions = {
    'source': null,
    'arrow': false,
    'maxResults': 5,
    'minHeight': 200,
    'maxHeight': 450,
    'displayedProperty': "value",
    'dropdownPosition': "auto",
    'sort': false,
    'sortBy': null,
    'sortOrder': 'asc',
    'isValidElement': ()=>true,
    'searchByEntry': false,
    'caseSensitive': false,
    'wordEndings': null,
    'ownValue': false
};

function Autocomplete(elem, options) {

    this.options = extend(defaultOptions, options);

    try {
        this.setInput(elem);
        this.setData(this.options.source);
    } catch (err) {
        window.console.error(err);
        return;
    }

    this.dropdown = new Dropdown(this.input, this.options);

    this.dropdown.select = this._selectElement.bind(this);

    this.dropdown.reload = function () {
        this._search(this.input.value);
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
                break;
        }
    };

    this._onClickOutside = this._onClickOutside.bind(this);

    this.lastSearch = null;
    this.selected = undefined;
    this.sourceIsDynamic = false;
}

Autocomplete.prototype = {
    messages: {
        error: 'Выберите значение из списка',
        warning: 'Значения нет в справочнике. <br> Возможно, вы ошиблись в написании'
    },

    setData(source){
        if (typeof source == 'string') {
            this.source = source; // data will be loaded later
        }
        else if (typeof source == 'function') {
            this.source = source;
            this.sourceIsDynamic = true;
        }
        else {
            if (!(source instanceof Array)) throw 'source should be instance of Array or String';
            let data;
            if (typeof source[0] == 'string') {
                data = source.map(str => {
                    value: str
                });
                this.options.displayedProperty = 'value';
            }
            else data = source;
            this.data = this.sort(data);
        }
    },

    sort(data){
        if (!this.options.sort) return;
        let p = this.options.sortBy ? this.options.sortBy : this.options.displayedProperty;
        let v = this.options.sortOrder == 'asc' ? -1 : 1;
        let result = data.sort(function (a, b) {
            if (a[p] < b[p]) return v;
            if (a[p] > b[p]) return -v;
            return 0;
        });
        return result;
    },

    setInput(elem){
        if (typeof elem == 'string') this.input = document.querySelector(elem);
        else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;
        else throw '1 argument should be String or instance of Element with tagName input';
    },

    _selectElement(element){
        this.input.value = element[this.options.displayedProperty];
        this.selected = element;
        this._finishTyping();
        this.onselect(element);
    },

    onselect(){
        // callback, should be set by client
    },

    _bindInputEvents(){
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
    },

    _keyDownEvent(event){
        if (this.dropdown.isVisible) this.dropdown.keyDownEvent(event);
        if (event.keyCode == 9 || event.keyCode == 13) { // tab or enter
            this._finishTyping();
            this._focusToNextControl();
        }
    },

    _makeRequest(url){
        return new Promise(function (resolve, reject) {
            if (this.xhr) this.xhr.abort();

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
            this.xhr = xhr;
        }.bind(this));
    },

    _abortRequest(){
        if (this.xhr) this.xhr.abort();
        this.dataRequestFinished = true;
    },

    _loadData(url){
        var that = this;

        return new Promise(function (resolve, reject) {

            let callback;
            that.dataRequestFinished = false;

            that._makeRequest(url)
                .then(data => {
                    callback = () => resolve(data)
                })
                .catch(error => {
                    callback = () => reject(error)
                })
                .then(() => {
                    that.dataRequestFinished = true;
                    if (!that.dropdown.isLoaderShown) callback();
                });

            setTimeout(function () {
                if (!that.dataRequestFinished) {
                    that.dropdown.showLoader();
                    let interval = setInterval(function () {
                        if (that.dataRequestFinished) {
                            clearInterval(interval);
                            if (callback) callback();
                        }
                    }, 1000);
                }
            }, 500);
        });
    },

    testByEntry(str, search){
        str = ' ' + str.replace(/"/g, "");
        return str.indexOf(' ' + search);

    },

    _getSearchResult(value){
        let searchData;
        if (this.lastSearch && value.startsWith(this.lastSearch.value)) {
            searchData = this.lastSearch.result;
        }
        else searchData = this.data;
        if (!this.data) return [];

        let lValue = this.options.caseSensitive ? value : value.toLowerCase();

        let result = [];
        for (let row of this.data) {
            if (!this.options.isValidElement(row)) continue;

            if (row[this.options.displayedProperty] == value) this.selected = row;

            for (let property in row) {
                if (row.hasOwnProperty(property)) {
                    let str = this.options.caseSensitive ? String(row[property]) : String(row[property]).toLowerCase();
                    if (this.options.searchByEntry) {

                        let pos = this.testByEntry(str, lValue);
                        if (pos != -1) {
                            row.search = {
                                pos, property,
                                length: lValue.length,
                            };
                            result.push(row);
                            break;
                        }
                    }
                    else {
                        if (str.startsWith(lValue)) {
                            result.push(row);
                            break;
                        }
                    }
                }
            }
        }

        this.lastSearch = {value, result};
        return result;
    },
    _search(value){
        this.selected = null;
        if (value) {
            if (this.sourceIsDynamic) {
                this._loadData(this.source(value))
                    .then(data => this.dropdown.showList(this.sort(data), this.options.maxResults))
                    .catch(err => this.dropdown.showError());
            }
            else {
                if (this.data)
                    this.dropdown.showList(this._getSearchResult(value.trim()), this.options.maxResults);
                else {
                    this._loadData(this.source)
                        .then(data => {
                            this.data = this.sort(data);
                            this.dropdown.showList(this._getSearchResult(value.trim()), this.options.maxResults);
                        }, this.options.maxResults)
                        .catch(err => this.dropdown.showError())
                }
            }
        }
        else this.dropdown.remove();
    },

    _validate(){
        if (!this.selected) {
            if (this.options.ownValue) {
                this.input.classList.add('warning');
                this._showUnderInput(this.messages.warning, 'warning');
            }
            else {
                this.input.classList.add('error');
                this._showUnderInput(this.messages.error, 'error');
            }
        }
        else this.input.classList.add('fulfilled');
    },

    _onFocusEvent(){
        document.body.addEventListener('click', this._onClickOutside);
        this.input.className = 'autocomplete';
        if (this.messageUnderInput) {
            this.input.parentNode.removeChild(this.messageUnderInput);
            this.messageUnderInput = null;
        }

        //if(!this.selected && this.lastSearch) this.dropdown.showList(this.lastSearch.result, this.options.maxResults);
        this.input.select();
        this.lastSearch = null;

        document.addEventListener('keydown', this);
    },

    _onClickOutside(event){
        if(event.target == this.input) return;
        this._finishTyping();
    },

    _finishTyping(){


        if (!this.dataRequestFinished) this._abortRequest();

        if (!this.selected && this.lastSearch && this.lastSearch.result.length == 1) {
            let elem = this.lastSearch.result[0];
            this._selectElement(elem);
        }
        this.dropdown.remove();
        this._validate();
        document.body.removeEventListener('click', this._onClickOutside);
        document.removeEventListener('keydown', this);
        this.input.removeEventListener('click', this);
    },

    _showUnderInput(text, className){
        let div = document.createElement('div');
        div.classList.add('autocomplete-message');
        div.classList.add(className);
        div.innerHTML = text;
        div.style.top = this.input.offsetHeight;

        this.input.parentNode.appendChild(div);
        this.messageUnderInput = div;
    },

    _focusToNextControl(){
        this.input.blur();
        let next = document.querySelector('[tabIndex="' + (+this.input.tabIndex + 1) + '"]');
        if (!next) {
            let inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
            next = inputs[inputs.indexOf(this.input) + 1];
        }
        if (next) next.focus();
    }

};