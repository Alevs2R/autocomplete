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

"use strict";


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
    return new Autocomplete(elem, options);
}

var _options = {
    'source': null,
    'arrow': false,
    'minResults': 5,
    'maxResults': 20,
    'minHeight': 200,
    'maxHeight': 450,
    'displayedProperty': "value",
    'dropdownPosition': "auto"
};

var keynumCodes = {
    UP: 38,
    DOWN: 40,
    ENTER: 13
};

function Autocomplete(elem, options) {
    this.options = extend(this.options, options);

    try {
        this.setInput(elem);
        this.setData(this.options.source);
    } catch (err) {
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

    setData: function setData(source) {
        var _this = this;

        if (typeof source == 'string') this._loadJSON(source).then(function (data) {
            return _this.data = data;
        }).catch(function (err) {
            return console.error(err);
        });else {
            if (!(source instanceof Array)) throw 'source should be instance of Array or String';
            if (typeof source[0] == 'string') {
                this.data = source.map(function (str) {
                    value: str;
                });
                this.options.displayedProperty = 'value';
            } else this.data = source;
        }
    },
    setInput: function setInput(elem) {
        console.log(elem);
        if (typeof elem == 'string') this.input = document.querySelector(elem);else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;else throw '1 argument should be String or instance of Element with tagName input';
    },
    _bindEvents: function _bindEvents() {
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
    },
    _unBindEvents: function _unBindEvents() {},
    _createDropdown: function _createDropdown() {
        var dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.visibility = 'hidden';

        this.elementsList = document.createElement('ul');
        dropdown.appendChild(this.elementsList);
        document.body.appendChild(dropdown);
        this.dropdown = dropdown;
    },
    _getDropdownHeight: function _getDropdownHeight(availableSpace) {
        return Math.min(Math.max(this.options.minHeight, availableSpace), this.options.maxHeight);
    },
    getCoords: function getCoords(elem) {
        // crossbrowser version
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), bottom: Math.round(top) + elem.offsetHeight, left: Math.round(left) };
    },
    _showDropdown: function _showDropdown() {
        var OFFSET_INPUT = 2;
        var WIDTH_INCREASE = 30;
        var coords = this.getCoords(this.input);
        var offsetBottom = document.body.clientHeight - coords.bottom;

        if (this.options.dropdownPosition == 'top' || this.options.dropdownPosition == 'auto' && offsetBottom < this.options.minHeight) {
            this.dropdown.style.maxHeight = this._getDropdownHeight(coords.top - OFFSET_INPUT) + 'px';
            this.dropdown.style.bottom = document.body.clientHeight - coords.top + OFFSET_INPUT + 'px';
        } else {
            this.dropdown.style.top = coords.top + this.input.offsetHeight + OFFSET_INPUT + "px";
            this.dropdown.style.maxHeight = this._getDropdownHeight(offsetBottom - OFFSET_INPUT) + 'px';
        }
        var maxWidth = document.body.clientWidth - coords.left;

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
    _loadJSON: function _loadJSON(url) {
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
    _getSearchResult: function _getSearchResult(value) {
        var searchData = void 0;
        if (this.lastSearch && value.startsWith(this.lastSearch.value)) {
            searchData = this.lastSearch.result;
        } else searchData = this.data;

        if (!this.data) return [];
        var result = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var row = _step.value;

                for (var property in row) {
                    if (row.hasOwnProperty(property) && String(row[property]).startsWith(value)) {
                        result.push(row);
                        break;
                    }
                }
                if (result.length == this.options.maxResults) break;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        this.lastSearch = { value: value, result: result };
        return result;
    },
    _search: function _search(value) {
        this._showSearchResult(this._getSearchResult(value.trim()));
    },
    _removeDropdown: function _removeDropdown() {
        if (!this.isDropdownCreated) return;
        this.dropdown.parentNode.removeChild(this.dropdown);
        document.body.style.overflow = 'auto';
        document.body.removeEventListener('click', this._removeDropdown);

        this.isDropdownCreated = false;
    },
    _showSearchResult: function _showSearchResult(result) {
        if (result.length == 0) {
            this._removeDropdown();
            return;
        }

        if (!this.isDropdownCreated) {
            this._createDropdown();
        }

        this.elementsList.innerHTML = '';
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = result[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var row = _step2.value;

                var li = document.createElement('li');
                li.appendChild(document.createTextNode(row[this.options.displayedProperty]));
                li.addEventListener('click', this.clickEvent.bind(this));
                li.listRow = row;
                this.elementsList.appendChild(li);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        this.setActiveElement(this.elementsList.firstChild);

        if (!this.isDropdownCreated) {
            this._showDropdown();
        }
    },
    clickEvent: function clickEvent(event) {
        this.input.value = event.target.innerHTML;
        this.selected = event.target.listRow;
        this._removeDropdown();
        event.stopPropagation();
    },
    setActiveElement: function setActiveElement(elem) {
        if (this.activeElement) this.activeElement.className = '';
        elem.className = 'active';
        this.activeElement = elem;
    },
    _keyDownEvent: function _keyDownEvent(event) {
        switch (event.keyCode) {
            case keynumCodes.DOWN:
                if (!this.activeElement.nextSibling) return;
                this.setActiveElement(this.activeElement.nextSibling);
                break;
            case keynumCodes.UP:
                if (!this.activeElement.previousSibling) return;
                this.setActiveElement(this.activeElement.previousSibling);
                break;
            case keynumCodes.ENTER:
                this.input.value = this.activeElement.listRow[this.options.displayedProperty];
                this._removeDropdown();
                break;

        }
    }
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=autocomplete.js.map