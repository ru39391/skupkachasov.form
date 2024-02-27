const ERROR_MESSAGES = {
    imgTypeError: 'Тип файлов неопределён',
    imgSizeError: 'Размер изображений превышает 20MB',
    currHandlerError: 'Не удалось обработать данные изображений',
};

const ITEMS_KEY = 'items';
const SIZE_KEY = 'size';

/**
 * Кастомизация поля загрузки изображений
 * @param {Object} options - объект настроек
 * @param {Array} options.inputs - массив элементов input[type="file"]
 * @param {string} options.imgClass - класс миниатюры загруженного изображения
 * @param {string} options.imgColClass - класс контейнера миниатюры изображения
 * @param {string} options.imgBtnClass - класс кнопки для удаления миниатюры изображения
 */
class ImgInputHandler {
    constructor(options) {
        this.hideClass = 'is-hidden';
        this.activeClass = 'is-active';
        this.errorClass = 'is-error';

        this.imgMaxSize = 20 * 1024 * 1024;
        this.filesData = { [ITEMS_KEY]: [], [SIZE_KEY]: 0 };

        this.imgBtnDefaultClass = 'js-btn-remove';

        this.imgHolderSel = '.js-input-holder';
        this.imgRowSel = '.js-image-row';
        this.imgAddBtnSel = '.js-images-add';
        this.imgRemoveBtnSel = '.js-images-remove';
        this.errorMessRowSel = '.js-error-message';
  
        this.init(options);
    }

    /**
     * Инициализация компонента
     * @param {Object} options - объект настроек
     */
    init(options) {
        const {
            inputs,
            imgClass,
            imgColClass,
            imgBtnClass
        } = options;
    
        if(!inputs.length) {
          return;
        }

        this.inputsList = inputs;
        this.filesArr = inputs.map((_) => ({...this.filesData}));
        this.imgColsData = inputs.reduce((acc, _, index) => ({...acc, [index]: []}), {});
        this.imgHolders = this.inputsList.map(input => input.closest(this.imgHolderSel));
        this.imgRows = this.imgHolders.map(holder => holder.querySelector(this.imgRowSel));
        this.imgAddBtns = this.imgHolders.map(holder => holder.querySelector(this.imgAddBtnSel));
        this.imgRemoveBtns = this.imgHolders.map(holder => holder.querySelector(this.imgRemoveBtnSel));
        this.errorMessRows = this.imgHolders.map(holder => holder.querySelector(this.errorMessRowSel));

        this.imgClassArr = [imgClass];
        this.imgColClassArr = [imgColClass];
        this.imgBtnClassArr = [imgBtnClass, this.imgBtnDefaultClass];

        this.bindEvents();
    }

    /**
     * Обработка ошибок
     * @param {number} idx - номер элемента в массиве
     * @param {string} mess - текст ошибки
     */
    handleError(idx, mess = '') {
        const errorMessRow = this.errorMessRows[idx];
        const { classList } = this.imgHolders[idx];

        errorMessRow.textContent = mess;
        mess ? classList.add(this.errorClass) : classList.remove(this.errorClass);
    }

    /**
     * Обновление значения input[type="file"] при изменении массива миниатюр
     * @param {number} idx - номер элемента в массиве
     */
    setInputValue(idx) {
        const filesList = new DataTransfer();

        this.filesArr[idx][ITEMS_KEY].forEach(file => filesList.items.add(file));
        this.inputsList[idx].files = filesList.files;

        this.handleControlBtns(idx);
    }

    /**
     * Сброс значения input[type="file"]
     * @param {number} idx - номер элемента в массиве
     */
    resetData(idx) {
        if(!this.imgColsData[idx].length) {
            return;
        };

        this.imgColsData[idx].forEach(item => {
            item.remove();
            item = null;
        });
        this.imgColsData[idx] = [];
        this.filesArr[idx] = {...this.filesData};

        this.setInputValue(idx);
    }

    /**
     * Удаление миниатюры изображения, обновление массива загруженных файлов
     * @param {Event} event - событие
     */
    removeItem(event) {
        const { target } = event;
        const imgRow = target.closest(this.imgRowSel);
        const rowIdx = this.imgRows.indexOf(imgRow);
        const btns = Array.from(imgRow.querySelectorAll(`.${this.imgBtnDefaultClass}`));
        const btnIdx = btns.indexOf(target);
        const filtredFilesArr = [...this.filesArr[rowIdx][ITEMS_KEY].filter((_, index) => index !== btnIdx)];

        this.imgColsData[rowIdx][btnIdx].remove();
        this.imgColsData[rowIdx][btnIdx] = null;
        this.imgColsData[rowIdx] = [...this.imgColsData[rowIdx].filter((_, index) => index !== btnIdx)];
        this.filesArr[rowIdx] = {
            [ITEMS_KEY]: filtredFilesArr,
            [SIZE_KEY]: filtredFilesArr.reduce((summ, item) => summ + item.size, 0),
        };

        this.setInputValue(rowIdx);
    }

    /**
     * Создание html-элемента
     * @param {Object} options - объект настроек
     * @param {string} options.tagName - тэг элемента
     * @param {Array} options.classArr - массив классов элемента
     * @param {Object} options.data - объект атрибутов элемента
     * @returns {HTMLElement} - разметка элемента
     */
    createItem({
        tagName,
        classArr,
        data
    }) {
        const params = Object.keys(data);
        const item = document.createElement(tagName);

        classArr.forEach(className => item.classList.add(className));
        params.forEach((param, index) => item[param] = Object.values(data)[index]);

        return item;
    }

    /**
     * Создание разметки для миниатюр загруженных изображений
     * @param {Object} item - объект обработанного файла
     * @returns {HTMLElement} - разметка контейнера изображения
     */
    loadReader(item) {
        const { result: src } = item;

        const col = this.createItem({
            tagName: 'div',
            classArr: this.imgColClassArr,
            data: {}
        });
        const img = this.createItem({
            tagName: 'img',
            classArr: this.imgClassArr,
            data: {
                src,
                alt: ''
            }
        });
        const btn = this.createItem({
            tagName: 'button',
            classArr: this.imgBtnClassArr,
            data: {
                type: 'button'
            }
        });

        btn.addEventListener('click', this.removeItem.bind(this));

        col.append(img);
        col.append(btn);

        return col;
    }

    /**
     * Обработка значения input[type="file"]
     * @param {number} idx - номер элемента в массиве
     * @param {Object} file - объект данных файла
     */
    handleInput(idx, file) {
        const reader = new FileReader();

        reader.addEventListener('load', (event) => {
            const { target } = event;
            const col = this.loadReader(target);

            this.imgColsData[idx].push(col);
            this.imgRows[idx].append(col);
        });
        reader.readAsDataURL(file);
    }

    /**
     * Изменение состояния кнопок удаления и загрузки изображений
     * @param {number} idx - номер элемента в массиве
     */
    handleControlBtns(idx) {
        const { classList: imgAddBtnClassList } = this.imgAddBtns[idx];
        const { classList: imgRemoveBtnClassList } = this.imgRemoveBtns[idx];
        const { classList: imgRowClassList } = this.imgRows[idx];

        [{
            isCorrect: this.filesArr[idx][ITEMS_KEY].length < 10,
            classList: imgAddBtnClassList
        }, {
            isCorrect: this.filesArr[idx][ITEMS_KEY].length > 0,
            classList: imgRemoveBtnClassList
        }, {
            isCorrect: this.filesArr[idx][ITEMS_KEY].length > 0,
            classList: imgRowClassList
        }].forEach(({isCorrect, classList}) => isCorrect ? classList.remove(this.hideClass) : classList.add(this.hideClass));
    }

    /**
     * Обновление поля ввода input[type="file"]
     * @param {Event} event - событие
     */
    changeInput(event) {
        const { target } = event;
        const files = Array.from(target.files);
        const idx = this.inputsList.indexOf(target);
    
        if(!files.length) {
            this.handleError(idx, ERROR_MESSAGES.imgTypeError);
            return;
        }

        this.resetData(idx);

        const items = [...[...Array(10)].map((_, index) => files[index]).filter(file => file)];
        const size = items.reduce((summ, item) => summ + item[SIZE_KEY], 0);

        this.filesArr[idx] = {...this.filesArr[idx], items, size};

        if(this.filesArr[idx][SIZE_KEY] > this.imgMaxSize) {
            this.handleError(idx, ERROR_MESSAGES.imgSizeError);
            return;
        } else {
            this.handleError(idx);
            this.handleControlBtns(idx);
            this.filesArr[idx][ITEMS_KEY].forEach(file => this.handleInput(idx, file));
        }
    }

    /**
     * Удаление всех загруженных изображений
     * @param {Event} event - событие
     */
    resetInput(event) {
        event.preventDefault();

        const { currentTarget } = event;

        this.resetData(this.imgRemoveBtns.indexOf(currentTarget));
    }

    /**
     * Добавление слушателей событий
     */
    bindEvents() {
        this.inputsList.forEach(input => {
            input.addEventListener('change', this.changeInput.bind(this));
        });
        this.imgRemoveBtns.forEach(btn => {
            btn.addEventListener('click', this.resetInput.bind(this));
        });
    }
}

const imgInputsArr = Array.from(document.querySelectorAll('.js-input-image'));
const imgInputHandler = new ImgInputHandler({
    inputs: imgInputsArr,
    imgClass: 'form__img',
    imgColClass: 'form__img-col',
    imgBtnClass: 'form__img-btn',
});