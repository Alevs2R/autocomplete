export default Dropdown;

function Dropdown(baseElement, options) {
    this.minHeight = options.minHeight;
    this.maxHeight = options.maxHeight;
    this.baseElement = baseElement;
    this.position = options.dropdownPosition;
    this.displayedProperty = options.displayedProperty;
    this.wordEndings = options.wordEndings;


    this.handleEvent = function (e) {
        switch (e.type) {
            case "keydown":
                this._keyDownEvent(e);
        }
    };
}

const NOTHING_FOUND = 'Не найдено';

const keynumCodes = {
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

    _create(){
        let dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.visibility = 'hidden';
        dropdown.addEventListener('click', (e)=>e.stopPropagation());


        document.body.appendChild(dropdown);
        this.dropdown = dropdown;

        this.isCreated = true;
    },

    _createElement(element){
        let val;
        if (element.hasOwnProperty('search') && element.search.property == this.displayedProperty) {
            let str = element[this.displayedProperty];
            let {pos, length} = element.search;
            val = str.substr(0, pos) + '<b>' + str.substr(pos, length) + '</b>' + str.substr(pos + length);
        }
        else {
            val = element[this.displayedProperty];
        }

        let li = document.createElement('li');
        li.innerHTML = val;
        li.addEventListener('click', this._clickEvent.bind(this));
        li.listRow = element;

        return li;
    },

    _createElementsList(elements){
        let result = document.createElement('ul');

        for (let row of elements) {
            result.appendChild(this._createElement(row));
        }

        return result;
    },

    addEmptyMessage(){
        let div = document.createElement('div');
        div.appendChild(document.createTextNode(NOTHING_FOUND));
        this.dropdown.appendChild(div);
    },

    showList(list, maxResults = null){
        if (!this.isCreated) this._create();
        else {
            this.clear();
        }

        if (list.length == 0) this.addEmptyMessage();
        else {
            if(maxResults == null || list.length <= maxResults) {
                let ul = this._createElementsList(list);
                this.setActiveElement(ul.firstChild);
                this.dropdown.appendChild(ul);
            } else {
                let ul = this._createElementsList(list.slice(0, maxResults));
                this.setActiveElement(ul.firstChild);
                this.dropdown.appendChild(ul);
                this.dropdown.appendChild(this._getSummary(maxResults, list.length));
            }

        }


        if (!this.isVisible) {
            this._show();
        }
        else this._updateWidth();
    },

    _getSummary(num, total){
        let div = document.createElement('div');
        let text = 'Показано '+num+' из '+total+' найденных '+this.wordEndings[1]+'. Уточните запрос, чтобы увидеть остальные';
        div.appendChild(document.createTextNode(text));
        div.className = "autocomplete-summary";
        return div;
    },

    _clickEvent(event){
        this.select(event.target.listRow);
    },

    _getHeight(availableSpace){
        return Math.min(Math.max(this.minHeight, availableSpace), this.maxHeight);
    },

    _getCoords(elem) { // crossbrowser version
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

    _updateWidth(){
        const WIDTH_INCREASE = 30;

        let leftOffset = this.dropdown.coordLeft;

        let maxWidth = document.body.clientWidth - leftOffset;
        let minWidth = Math.min(this.baseElement.offsetWidth + WIDTH_INCREASE, maxWidth);

        let width;
        let ul = this.dropdown.getElementsByTagName('ul');
        if(ul.length > 0){
            this.dropdown.style.width = 'auto';
            width = Math.min(Math.max(minWidth, ul[0].offsetWidth + 1), maxWidth);
            ul[0].style.width = '100%';
        }
        else width = minWidth;
        this.dropdown.style.width = width + 'px';
    },

    _show(){
        if (!this.isCreated) return;

        const OFFSET_INPUT = 2;

        let coords = this._getCoords(this.baseElement);
        let offsetBottom = document.body.clientHeight - coords.bottom;

        if (this.position == 'top' || (this.position == 'auto' && offsetBottom < this.minHeight)) {
            this.dropdown.style.maxHeight = this._getHeight(coords.top - OFFSET_INPUT) + 'px';
            this.dropdown.style.bottom = document.body.clientHeight - coords.top + OFFSET_INPUT + 'px';
        }
        else {
            this.dropdown.style.top = (coords.top + this.baseElement.offsetHeight + OFFSET_INPUT) + "px";
            this.dropdown.style.maxHeight = this._getHeight(offsetBottom - OFFSET_INPUT) + 'px';
        }

        this.dropdown.coordLeft = coords.left;
        this.dropdown.style.left = coords.left + 'px';
        this.dropdown.style.visibility = 'visible';

        this._updateWidth();

        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', this);

        this.isVisible = true;
        //TODO reaction on window resize
    },

    setActiveElement(elem){
        if (this.activeElement) this.activeElement.className = '';
        elem.className = 'active';
        this.activeElement = elem;
    },

    remove(){
        if (!this.isCreated) return;
        this.dropdown.parentNode.removeChild(this.dropdown);
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', this);

        this.isCreated = false;
        this.isVisible = false;
    },

    clear(){
        this.dropdown.innerHTML = '';
    },

    select(){
        // callback, should be set by client
    },

    _keyDownEvent(event){
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
    },

}
;
