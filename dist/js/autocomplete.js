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
/*
@author Alexey Evlampev
 */

exports.default = Dropdown;


function Dropdown(baseElement, options) {
    this.minHeight = options.minHeight;
    this.maxHeight = options.maxHeight;
    this.baseElement = baseElement;
    this.position = options.dropdownPosition;
    this.displayedProperty = options.displayedProperty;
    this.wordEndings = options.wordEndings;

    this.isCreated = false;
    this.isVisible = false;
    this.activeElement = undefined;
    this.elementsList = null;
    this.dropdown = null;
    this.isLoaderShown = false;
}

var NOTHING_FOUND = 'Не найдено';
var LOADING = 'Загрузка';

var keynumCodes = {
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    ESC: 27
};

var loader = '<svg class="circle" width="16" height="16"><circle class="path" cx="8" cy="8" r="6" stroke-miterlimit="10"/></svg>';

Dropdown.prototype = {
    _create: function _create() {
        var dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.visibility = 'hidden';
        dropdown.addEventListener('click', function (e) {
            return e.stopPropagation();
        });

        document.body.appendChild(dropdown);
        this.dropdown = dropdown;

        this.isCreated = true;
    },
    _createElement: function _createElement(element) {
        var val = void 0;
        if (element.hasOwnProperty('search') && element.search.property == this.displayedProperty) {
            var str = element[this.displayedProperty];
            var _element$search = element.search,
                pos = _element$search.pos,
                length = _element$search.length;

            val = str.substr(0, pos) + '<b>' + str.substr(pos, length) + '</b>' + str.substr(pos + length);
        } else {
            val = element[this.displayedProperty];
        }

        var li = document.createElement('li');
        li.innerHTML = val;
        li.addEventListener('click', this._clickEvent.bind(this));
        li.listRow = element;

        return li;
    },
    _createElementsList: function _createElementsList(elements) {
        var result = document.createElement('ul');

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var row = _step.value;

                result.appendChild(this._createElement(row));
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

        result.addEventListener('mouseover', function () {
            document.body.style.overflow = 'hidden';
        });
        result.addEventListener('mouseout', function () {
            document.body.style.overflow = 'auto';
        });

        return result;
    },
    _createLoader: function _createLoader() {
        var div = document.createElement('div');
        div.className = "loader";
        div.innerHTML = loader;
        var span = document.createElement('span');
        span.appendChild(document.createTextNode(LOADING));
        div.appendChild(span);
        return div;
    },
    _createEmptyMessage: function _createEmptyMessage() {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(NOTHING_FOUND));
        return div;
    },
    showLoader: function showLoader() {
        if (this.isLoaderShown) return;
        this.clear();
        this.dropdown.appendChild(this._createLoader());
        this._show();
        this.isLoaderShown = true;
    },
    showError: function showError() {
        var _this = this;

        var CONNECTION_ERROR = 'Что-то пошло не так. Проверьте соединение с интернетом и попробуйте еще раз';
        var RELOAD = 'Обновить';

        this.clear();
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(CONNECTION_ERROR));

        var reloadBtn = document.createElement('div');
        reloadBtn.className = 'autocomplete-control';
        reloadBtn.appendChild(document.createTextNode(RELOAD));

        reloadBtn.addEventListener('click', function () {
            return _this.reload();
        });
        this.onEnterClick = function () {
            return _this.reload();
        };

        this.dropdown.appendChild(div);
        this.dropdown.appendChild(reloadBtn);

        this._show();
    },
    showList: function showList(list) {
        var _this2 = this;

        var maxResults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this.clear();

        if (list.length == 0) this.dropdown.appendChild(this._createEmptyMessage());else {
            if (maxResults == null || list.length <= maxResults) {
                var ul = this._createElementsList(list);
                this.dropdown.appendChild(ul);
                this.setActiveElement(ul.firstChild);
            } else {
                var _ul = this._createElementsList(list.slice(0, maxResults));
                this.dropdown.appendChild(_ul);
                this.setActiveElement(_ul.firstChild);
                this.dropdown.appendChild(this._getSummary(maxResults, list.length));
            }

            this.onEnterClick = function () {
                return _this2.select(_this2.activeElement.listRow);
            };
        }

        //if (!this.isVisible) {
        this._show();
        //}
        //else this._updateWidth();
    },
    _getSummary: function _getSummary(num, total) {
        var div = document.createElement('div');
        var str = total % 100 != 11 && total % 10 == 1 ? 'найденного ' + this.wordEndings[0] : 'найденных ' + this.wordEndings[1];
        var text = 'Показано ' + num + ' из ' + total + ' ' + str + '. Уточните запрос, чтобы увидеть остальные';
        div.appendChild(document.createTextNode(text));
        div.className = "autocomplete-summary";
        return div;
    },
    _clickEvent: function _clickEvent(event) {
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
    _updateWidth: function _updateWidth() {
        var WIDTH_INCREASE = 30;

        var leftOffset = this.dropdown.coordLeft;

        var maxWidth = document.body.clientWidth - leftOffset;
        var minWidth = Math.min(this.baseElement.offsetWidth + WIDTH_INCREASE, maxWidth);

        var width = void 0;
        var ul = this.dropdown.getElementsByTagName('ul');
        if (ul.length > 0) {
            this.dropdown.style.width = 'auto';
            width = Math.min(Math.max(minWidth, ul[0].offsetWidth + 1), maxWidth);
            ul[0].style.width = '100%';
            ul[0].style.display = 'block';
        } else width = minWidth;
        this.dropdown.style.width = width + 'px';
    },
    _setListHeight: function _setListHeight(totalHeight) {
        var summaryHeight = 42;
        var ul = this.dropdown.getElementsByTagName('ul');
        if (ul.length > 0) {
            if (this.dropdown.getElementsByTagName('div').length > 0) {
                ul[0].style.maxHeight = totalHeight - summaryHeight + 'px';
            } else ul[0].style.maxHeight = totalHeight + 'px';
        }
    },
    _show: function _show() {
        if (!this.isCreated) return;

        var OFFSET_INPUT = 2;

        var coords = this._getCoords(this.baseElement);
        var offsetBottom = document.body.clientHeight - coords.bottom;

        if (this.position == 'top' || this.position == 'auto' && offsetBottom < this.minHeight) {
            this._setListHeight(this._getHeight(coords.top - OFFSET_INPUT));
            this.dropdown.style.bottom = document.body.clientHeight - coords.top + OFFSET_INPUT + 'px';
        } else {
            this.dropdown.style.top = coords.top + this.baseElement.offsetHeight + OFFSET_INPUT + "px";
            this._setListHeight(this._getHeight(offsetBottom - OFFSET_INPUT));
        }

        this.dropdown.coordLeft = coords.left;
        this.dropdown.style.left = coords.left + 'px';

        this._updateWidth();

        this.dropdown.style.visibility = 'visible';

        this.isVisible = true;
        //TODO reaction on window resize
    },
    setActiveElement: function setActiveElement(elem) {
        if (this.activeElement) this.activeElement.className = '';
        elem.className = 'active';
        this.activeElement = elem;

        var offsetTop = elem.offsetTop,
            offsetBottom = offsetTop + 30;
        var ul = this.dropdown.getElementsByTagName('ul')[0];
        if (ul.scrollTop + ul.clientHeight < offsetBottom) {
            ul.scrollTop = offsetBottom - ul.clientHeight;
        } else if (offsetTop < ul.scrollTop) {
            ul.scrollTop = offsetTop;
        }
    },
    _resetVars: function _resetVars() {
        this.isCreated = false;
        this.isVisible = false;
        this.activeElement = null;
        this.isLoaderShown = false;
    },
    remove: function remove() {
        if (!this.isCreated) return;

        this._resetVars();
        this.dropdown.parentNode.removeChild(this.dropdown);
        document.body.style.overflow = 'auto';
    },
    clear: function clear() {
        this.isLoaderShown = false;
        this.activeElement = null;
        if (!this.isCreated) this._create();else {
            this.dropdown.innerHTML = '';
        }
    },
    select: function select() {
        // callback, should be set by client
    },
    keyDownEvent: function keyDownEvent(event) {
        var preventdef = true;
        switch (event.keyCode) {
            case keynumCodes.DOWN:
                if (!this.activeElement || !this.activeElement.nextSibling) return;
                this.setActiveElement(this.activeElement.nextSibling);
                break;
            case keynumCodes.UP:
                if (!this.activeElement || !this.activeElement.previousSibling) return;
                this.setActiveElement(this.activeElement.previousSibling);
                break;
            case keynumCodes.ENTER:
                if (this.onEnterClick) this.onEnterClick();
                break;
            case keynumCodes.ESC:
                this.remove();
                break;
            default:
                preventdef = false;
                break;
        }
        if (preventdef) event.preventDefault();
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

/*
@author Alexey Evlampev
 */

__webpack_require__(1);


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

var defaultOptions = {
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
    'isValidElement': function isValidElement() {
        return true;
    },
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

    this.dropdown = new _dropdown2.default(this.input, this.options);

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

    setData: function setData(source) {
        if (typeof source == 'string') {
            this.source = source; // data will be loaded later
        } else if (typeof source == 'function') {
            this.source = source;
            this.sourceIsDynamic = true;
        } else {
            if (!(source instanceof Array)) throw 'source should be instance of Array or String';
            var data = void 0;
            if (typeof source[0] == 'string') {
                data = source.map(function (str) {
                    value: str;
                });
                this.options.displayedProperty = 'value';
            } else data = source;
            this.data = this.sort(data);
        }
    },
    sort: function sort(data) {
        if (!this.options.sort) return;
        var p = this.options.sortBy ? this.options.sortBy : this.options.displayedProperty;
        var v = this.options.sortOrder == 'asc' ? -1 : 1;
        var result = data.sort(function (a, b) {
            if (a[p] < b[p]) return v;
            if (a[p] > b[p]) return -v;
            return 0;
        });
        return result;
    },
    setInput: function setInput(elem) {
        if (typeof elem == 'string') this.input = document.querySelector(elem);else if (elem.hasOwnProperty('tagName') && elem.tagName == 'input') this.input = elem;else throw '1 argument should be String or instance of Element with tagName input';
    },
    _selectElement: function _selectElement(element) {
        this.input.value = element[this.options.displayedProperty];
        this.selected = element;
        this._finishTyping();
        this.onselect(element);
    },
    onselect: function onselect() {
        // callback, should be set by client
    },
    _bindInputEvents: function _bindInputEvents() {
        this.input.addEventListener("input", this, false);
        this.input.addEventListener("focus", this, false);
    },
    _keyDownEvent: function _keyDownEvent(event) {
        if (this.dropdown.isVisible) this.dropdown.keyDownEvent(event);
        if (event.keyCode == 9 || event.keyCode == 13) {
            // tab or enter
            this._finishTyping();
            this._focusToNextControl();
        }
    },
    _makeRequest: function _makeRequest(url) {
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
    _abortRequest: function _abortRequest() {
        if (this.xhr) this.xhr.abort();
        this.dataRequestFinished = true;
    },
    _loadData: function _loadData(url) {
        var that = this;

        return new Promise(function (resolve, reject) {

            var callback = void 0;
            that.dataRequestFinished = false;

            that._makeRequest(url).then(function (data) {
                callback = function callback() {
                    return resolve(data);
                };
            }).catch(function (error) {
                callback = function callback() {
                    return reject(error);
                };
            }).then(function () {
                that.dataRequestFinished = true;
                if (!that.dropdown.isLoaderShown) callback();
            });

            setTimeout(function () {
                if (!that.dataRequestFinished) {
                    that.dropdown.showLoader();
                    var interval = setInterval(function () {
                        if (that.dataRequestFinished) {
                            clearInterval(interval);
                            if (callback) callback();
                        }
                    }, 1000);
                }
            }, 500);
        });
    },
    testByEntry: function testByEntry(str, search) {
        str = ' ' + str.replace(/"/g, "");
        return str.indexOf(' ' + search);
    },
    _getSearchResult: function _getSearchResult(value) {
        var searchData = void 0;
        if (this.lastSearch && value.startsWith(this.lastSearch.value)) {
            searchData = this.lastSearch.result;
        } else searchData = this.data;
        if (!this.data) return [];

        var lValue = this.options.caseSensitive ? value : value.toLowerCase();

        var result = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var row = _step.value;

                if (!this.options.isValidElement(row)) continue;

                if (row[this.options.displayedProperty] == value) this.selected = row;

                for (var property in row) {
                    if (row.hasOwnProperty(property)) {
                        var str = this.options.caseSensitive ? String(row[property]) : String(row[property]).toLowerCase();
                        if (this.options.searchByEntry) {

                            var pos = this.testByEntry(str, lValue);
                            if (pos != -1) {
                                row.search = {
                                    pos: pos, property: property,
                                    length: lValue.length
                                };
                                result.push(row);
                                break;
                            }
                        } else {
                            if (str.startsWith(lValue)) {
                                result.push(row);
                                break;
                            }
                        }
                    }
                }
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
        var _this = this;

        this.selected = null;
        if (value) {
            if (this.sourceIsDynamic) {
                this._loadData(this.source(value)).then(function (data) {
                    return _this.dropdown.showList(_this.sort(data), _this.options.maxResults);
                }).catch(function (err) {
                    return _this.dropdown.showError();
                });
            } else {
                if (this.data) this.dropdown.showList(this._getSearchResult(value.trim()), this.options.maxResults);else {
                    this._loadData(this.source).then(function (data) {
                        _this.data = _this.sort(data);
                        _this.dropdown.showList(_this._getSearchResult(value.trim()), _this.options.maxResults);
                    }, this.options.maxResults).catch(function (err) {
                        return _this.dropdown.showError();
                    });
                }
            }
        } else this.dropdown.remove();
    },
    _validate: function _validate() {
        if (!this.selected) {
            if (this.options.ownValue) {
                this.input.classList.add('warning');
                this._showUnderInput(this.messages.warning, 'warning');
            } else {
                this.input.classList.add('error');
                this._showUnderInput(this.messages.error, 'error');
            }
        } else this.input.classList.add('fulfilled');
    },
    _onFocusEvent: function _onFocusEvent() {
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
    _onClickOutside: function _onClickOutside(event) {
        if (event.target == this.input) return;
        this._finishTyping();
    },
    _finishTyping: function _finishTyping() {

        if (!this.dataRequestFinished) this._abortRequest();

        if (!this.selected && this.lastSearch && this.lastSearch.result.length == 1) {
            var elem = this.lastSearch.result[0];
            this._selectElement(elem);
        }
        this.dropdown.remove();
        this._validate();
        document.body.removeEventListener('click', this._onClickOutside);
        document.removeEventListener('keydown', this);
        this.input.removeEventListener('click', this);
    },
    _showUnderInput: function _showUnderInput(text, className) {
        var div = document.createElement('div');
        div.classList.add('autocomplete-message');
        div.classList.add(className);
        div.innerHTML = text;
        div.style.top = this.input.offsetHeight;

        this.input.parentNode.appendChild(div);
        this.messageUnderInput = div;
    },
    _focusToNextControl: function _focusToNextControl() {
        this.input.blur();
        var next = document.querySelector('[tabIndex="' + (+this.input.tabIndex + 1) + '"]');
        if (!next) {
            var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
            next = inputs[inputs.indexOf(this.input) + 1];
        }
        if (next) next.focus();
    }
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=autocomplete.js.map