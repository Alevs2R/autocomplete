(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Autocomplete"] = factory();
	else
		root["Autocomplete"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);

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

/***/ })
/******/ ]);
});
//# sourceMappingURL=autocomplete.js.map