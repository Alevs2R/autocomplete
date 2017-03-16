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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Dropdown;


function Dropdown(baseElement, options) {
    this.minHeight = options.minHeight;
    this.maxHeight = options.maxHeight;
    this.baseElement = baseElement;
    this.position = options.dropdownPosition;
    this.displayedProperty = options.displayedProperty;
}

var keynumCodes = {
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    ESC: 27
};

Dropdown.prototype = {

    isCreated: false,
    isVisible: false,
    activeElement: undefined,
    elementsList: null,
    dropdown: null,

    _create: function _create() {
        var dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.visibility = 'hidden';

        this.elementsList = document.createElement('ul');
        dropdown.appendChild(this.elementsList);
        document.body.appendChild(dropdown);
        this.dropdown = dropdown;

        this.isCreated = true;
    },
    addElement: function addElement(element) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(element[this.displayedProperty]));
        li.addEventListener('click', this._clickEvent.bind(this));
        li.listRow = element;
        this.elementsList.appendChild(li);
    },
    showList: function showList(list) {
        if (!this.isCreated) this._create();else {
            this.clear();
        }

        if (list.length == 0) {
            this.remove();
            return;
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var row = _step.value;

                this.addElement(row);
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

        this.setActiveElement(this.elementsList.firstChild);

        if (!this.isVisible) {
            this._show();
        }
    },
    _clickEvent: function _clickEvent(event) {
        event.stopPropagation();
        this.select(event.target.listRow);
    },
    _getHeight: function _getHeight(availableSpace) {
        return Math.min(Math.max(this.minHeight, availableSpace), this.maxHeight);
    },
    _getCoords: function _getCoords(elem) {
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
    _show: function _show() {
        if (!this.isCreated) return;

        var OFFSET_INPUT = 2;
        var WIDTH_INCREASE = 30;

        var coords = this._getCoords(this.baseElement);
        var offsetBottom = document.body.clientHeight - coords.bottom;

        if (this.position == 'top' || this.position == 'auto' && offsetBottom < this.minHeight) {
            this.dropdown.style.maxHeight = this._getHeight(coords.top - OFFSET_INPUT) + 'px';
            this.dropdown.style.bottom = document.body.clientHeight - coords.top + OFFSET_INPUT + 'px';
        } else {
            this.dropdown.style.top = coords.top + this.baseElement.offsetHeight + OFFSET_INPUT + "px";
            this.dropdown.style.maxHeight = this._getHeight(offsetBottom - OFFSET_INPUT) + 'px';
        }
        var maxWidth = document.body.clientWidth - coords.left;

        this.dropdown.style.left = coords.left + 'px';
        this.dropdown.style.maxWidth = maxWidth + 'px';
        this.dropdown.style.minWidth = Math.min(this.baseElement.offsetWidth + WIDTH_INCREASE, maxWidth) + 'px';
        this.dropdown.style.visibility = 'visible';

        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', this);

        this.isVisible = true;
        //TODO reaction on window resize
    },
    setActiveElement: function setActiveElement(elem) {
        if (this.activeElement) this.activeElement.className = '';
        elem.className = 'active';
        this.activeElement = elem;
    },
    remove: function remove() {
        if (!this.isCreated) return;
        this.dropdown.parentNode.removeChild(this.dropdown);
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', this);

        this.isCreated = false;
        this.isVisible = false;
    },
    clear: function clear() {
        if (!this.isCreated) {
            this._create();
        }
        this.elementsList.innerHTML = '';
    },
    select: function select() {},
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
                this.select(this.activeElement.listRow);
                break;
            case keynumCodes.ESC:
                this.remove();
                break;

        }
    }
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _dropdown = __webpack_require__(0);

var _dropdown2 = _interopRequireDefault(_dropdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(1);


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

function Autocomplete(elem, options) {
    this.options = extend(this.options, options);

    try {
        this.setInput(elem);
        this.setData(this.options.source);
    } catch (err) {
        console.error(err);
        return;
    }

    this.dropdown = new _dropdown2.default(this.input, this.options);

    this.dropdown.select = function (element) {
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
        if (typeof elem == 'string') this.input = document.querySelector(elem);else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;else throw '1 argument should be String or instance of Element with tagName input';
    },
    _bindInputEvents: function _bindInputEvents() {
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
        this.input.addEventListener("click", function (e) {
            e.stopPropagation();
        });
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

                if (row[this.options.displayedProperty] == value) this.selected = row;

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
        this.selected = null;
        this.dropdown.showList(this._getSearchResult(value.trim()));
    },
    _validate: function _validate() {
        if (!this.selected) {
            this.input.className += ' error';
        }
    },
    _onFocusEvent: function _onFocusEvent() {
        document.body.addEventListener('click', this._finishTyping);
        this.input.className = 'autocomplete';

        if (!this.selected && this.lastSearch) this.dropdown.showList(this.lastSearch.result);
    },
    _finishTyping: function _finishTyping() {
        this.dropdown.remove();
        this._validate();
        document.body.removeEventListener('click', this._finishTyping);
    }
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=autocomplete.js.map