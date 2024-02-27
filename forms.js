const FORM_SELECTORS = {
    form: '.js-form',
    inputHolder: '.js-input-holder',
    input: '.js-input-field',
    submitBtn: '.js-form-submit',
    errorContent: '.js-error-message',
    formContent: '.js-form-content',
    respContentSel: '.js-form-response',
    fieldset: '.js-form-fieldset',
    link: '.js-form-link',
    imgPreview: '.js-image-preview',
    imgToggler: '.js-image-toggler',
    imgInput: '.js-input-image'
}

const INPUT_CLASSNAMES = {
    phoneInput: 'js-input-type-phone',
    emailInput: 'js-input-type-email',
    defaultInput: 'js-input-type-default',
    inputOptional: 'js-optional'
}

const FORM_STATE = {
    error: 'is-error',
    visible: 'is-visible',
    hidden: 'is-hidden',
}

const ERROR_MESSAGES = {
    formInvalid: 'Поля формы заполнены неверно',
    phoneInvalid: 'Неверно введен телефон',
    emailInvalid: 'Неверно введен e-mail',
    textInvalid: 'Недопустимые символы',
    inputEmpty: 'Поле не может быть пустым',
    inputRequired: 'Поле не может быть пустым',
    minLengthInvalid: 'Слишком короткое значение',
    maxLengthInvalid: 'Значение слишком длинное',
    imgTypeError: 'Изображение не определено',
    imgSizeError: 'Изображение превышает 2MB'
};

/**
* Проверка необязательности заполнения поля
* @param {HTMLElement} field - поле ввода
* @return {boolean} - является ли поле необязательным к заполнению
*/
const isInputOptional = (field) => {
    return field.classList.contains(INPUT_CLASSNAMES.inputOptional);
};

/**
* Валидация строки (напр. - имя фамилия)
* @param string
* @return {boolean}
*/
const validateString = (string) => {
    const re = /^[a-zа-яё\s]+$/iu;
    return re.test(string);
}

/**
* Валидация телефона по длине, так как используется маска телефона
* 18 - необходимое количество символов в маске телефона
* @param phone
* @return {boolean}
*/
const validatePhone = (phone) => {
    return !(phone.length < 18);
}

/**
* Отображение описания ошибки поля при обработке формы
* @param {HTMLElement} field - поле ввода
* @param {string} message - текст ошибки
*/
const showErrorMessage = (field, message) => {
    field.closest(FORM_SELECTORS.inputHolder).querySelector(FORM_SELECTORS.errorContent).textContent = message;
};

/**
* Добавляет/убирает модификатор контейнеру поля ввода
* @param {HTMLElement} field - поле ввода
* @param {boolean} isValid - валидно ли значение поля по умолчанию
*/
const handleInputHolder = (field, isValid) => {
    const inputHolder = field.closest(FORM_SELECTORS.inputHolder);
    if(!inputHolder) console.log(field);
    isValid
      ? inputHolder.classList.add(FORM_STATE.error)
      : inputHolder.classList.remove(FORM_STATE.error);
};

/**
* Валидация обычного поля (мин. длина строки - 2 симв., макс. длина - 76)
* @param input
* @return {boolean}
*/
const checkStringField = (input) => {
    const { value } = input;
    const [isValid, isMinLength] = isInputOptional(input)
      ? [validateString(value) || value.length === 0, value.length > 1 || value.length === 0]
      : [validateString(value), value.length > 1];
    
    const incorrectCases = [
      !isValid,
      !isMinLength,
      value.length > 76
    ];
    const errorMessages = [
      ERROR_MESSAGES.textInvalid,
      ERROR_MESSAGES.minLengthInvalid,
      ERROR_MESSAGES.maxLengthInvalid
    ];
    
    if (value.length === 0 && !isInputOptional(input)) {
      showErrorMessage(input, ERROR_MESSAGES.inputRequired);
    } else {
      incorrectCases.forEach((item, index) => {
        if(item) showErrorMessage(input, errorMessages[index]);
      });
    }
    
    handleInputHolder(input, incorrectCases.some(item => item));
    
    return incorrectCases.filter(item => item).length === 0;
}

/**
* Валидация поля телефона, если не проходит, то добавляем класс ошибки
* 9, 8, 4, 3 - допустимые цифры после +7
* @param input
* @return {boolean}
*/
const checkPhoneField = (input) => {
    const { value } = input;
    const incorrectCases = [
      !validatePhone(value),
      ![3,4,8,9].includes(Number(value.split('')[4]))
    ];
    const isValid = incorrectCases.some(item => item);
    
    if (value.length === 0 && !isInputOptional(input)) {
      showErrorMessage(input, ERROR_MESSAGES.inputRequired);
    } else {
      incorrectCases.forEach(item => {
        if(item) showErrorMessage(input, ERROR_MESSAGES.phoneInvalid);
      });
    }
    
    handleInputHolder(input, isValid);
    
    return isInputOptional(input) ? isValid && value.length === 0 : incorrectCases.filter(item => item).length === 0;
}

const validateField = (input, classList) => {
    const {phoneInput, emailInput, defaultInput} = INPUT_CLASSNAMES;
    
    if(classList.includes(defaultInput)) {
      return checkStringField(input);
    }
    
    if(classList.includes(phoneInput)) {
      return checkPhoneField(input);
    }
}

const changeInput = (arr) => {
    const isValidatedArr = arr.map(item => validateField(item, Array.from(item.classList)));

    return isValidatedArr.every(item => item);
}

const handleInputs = (form) => {
    const {input: inputSel, submitBtn: submitBtnSel} = FORM_SELECTORS;
    const fieldsArr = Array.from(form.querySelectorAll(inputSel));
    const submitBtn = form.querySelector(submitBtnSel);
    submitBtn.disabled = true;

    fieldsArr.forEach((input, _, arr) => input.addEventListener('input', () => {
        submitBtn.disabled = !changeInput(arr);
    }));
}

const setImgInputData = (input) => {
    const {
        inputHolder: inputHolderSel,
        errorContent: errorContentSel,
        imgPreview: imgPreviewSel,
        imgToggler: imgTogglerSel
    } = FORM_SELECTORS;
    const inputHolder = input.closest(inputHolderSel);

    return {
        inputHolder,
        imgPreview: inputHolder.querySelector(imgPreviewSel),
        imgToggler: inputHolder.querySelector(imgTogglerSel),
        errorContent: inputHolder.querySelector(errorContentSel)
    }
}

const unsetImgPreview = (input, errorMsg = '') => {
    if(!input) {
        return;
    }

    const {
        imgPreview,
        imgToggler,
        errorContent
    } = setImgInputData(input);

    errorContent.textContent = errorMsg;
    input.value = '';
    imgPreview.src = '#';
    imgPreview.classList.add(FORM_STATE.hidden);
    imgToggler.classList.remove(FORM_STATE.visible);
}

const handleImgPreview = ({ input, inputHolder, imgPreview, imgToggler, errorContent }) => {
    const file = input.files[0];
    if(!file) {
        inputHolder.classList.add(FORM_STATE.error);
        errorContent.textContent = ERROR_MESSAGES.imgTypeError;
        return;
    }

    const reader = new FileReader();

    if(file.size < 2 * 1024 * 1024) {
        reader.addEventListener('load', (event) => {
            const { result: src } = event.target;

            inputHolder.classList.remove(FORM_STATE.error);
            errorContent.textContent = '';
            imgPreview.src = src;
            imgPreview.classList.remove(FORM_STATE.hidden);
            imgToggler.classList.add(FORM_STATE.visible);
        });
        reader.readAsDataURL(file);
    } else {
        inputHolder.classList.add(FORM_STATE.error);
        unsetImgPreview(input, ERROR_MESSAGES.imgSizeError);
    }
    
    imgToggler.addEventListener('click', (event) => {
        event.preventDefault();

        inputHolder.classList.remove(FORM_STATE.error);
        unsetImgPreview(input);
    });
}

const handleImgInput = (event) => {
    const { target } = event;
    const {
        inputHolder,
        imgPreview,
        imgToggler,
        errorContent
    } = setImgInputData(target);

    handleImgPreview({
        input: target,
        inputHolder,
        imgPreview,
        imgToggler,
        errorContent
    });
}

const initFormHandler = () => {
    const formsArr = Array.from(document.querySelectorAll(FORM_SELECTORS.form));

    if(!formsArr.length) {
        return;
    }

    formsArr.forEach(form => handleInputs(form));
}

const initImgHandler = () => {
    const imgInputsArr = Array.from(document.querySelectorAll(FORM_SELECTORS.imgInput));

    if(!imgInputsArr.length) {
        return;
    }

    imgInputsArr.forEach(input => input.addEventListener('change', handleImgInput));
}

const handlePhoneInput = (input) => {
  let keyCode;

  function mask(event) {
      if (!event.keyCode) {
          keyCode = event.keyCode;
      }
      const pos = this.selectionStart;
      if (pos < 3) event.preventDefault();
      const matrix = '+7 (___) ___ __ __';
      let i = 0;
      const def = matrix.replace(/\D/g, '');
      const val = this.value.replace(/\D/g, '');
      let newValue = matrix.replace(/[_\d]/g, (a) =>
          i < val.length ? val.charAt(i++) || def.charAt(i) : a
      );
      i = newValue.indexOf('_');
      if (i !== -1) {
          newValue = newValue.slice(0, i);
      }
      let reg = matrix
        .substr(0, this.value.length)
        .replace(/_+/g, (a) => `\\d{1,${a.length}}`)
        .replace(/[+()]/g, '\\$&');
      reg = new RegExp(`^${reg}$`);
      if (
          !reg.test(this.value) ||
          this.value.length < 5 ||
          (keyCode > 47 && keyCode < 58)
      ) {
          this.value = newValue;
      }
      if (event.type === 'blur' && this.value.length < 5) this.value = '';
  }

  input.addEventListener('input', mask, false);
  input.addEventListener('focus', mask, false);
  input.addEventListener('blur', mask, false);
  input.addEventListener('keydown', mask, false);
}

const initPhoneMask = () => {
    const phoneInputsArr = Array.from(document.querySelectorAll('input[type="tel"]'));
  
    if(!phoneInputsArr.length) {
        return;
    }

    phoneInputsArr.forEach(input => handlePhoneInput(input));
}

const handleResponse = (event) => {
    const { form, response } = event.detail;
    const {
        submitBtn: submitBtnSel,
        formContent: formContentSel,
        respContentSel: respContentSel,
        fieldset: fieldsetSel,
        imgInput: imgInputSel,
        link: linkSel
    } = FORM_SELECTORS;
    const submitBtn = form.querySelector(submitBtnSel);
    const formContent = form.querySelector(formContentSel);
    const respContent = form.querySelector(respContentSel);
    const fieldset = form.querySelector(fieldsetSel);
    const imgInput = form.querySelector(imgInputSel);
    const link = form.querySelector(linkSel);

    respContent.textContent = response.message;
    formContent.classList.remove(FORM_STATE.hidden);

    if(response.success) {
        fieldset.classList.add(FORM_STATE.hidden);
        unsetImgPreview(imgInput);
    } else {
        formContent.classList.add(FORM_STATE.error);
    }

    link.addEventListener('click', (event) => {
        event.preventDefault();
        submitBtn.disabled = true;
        fieldset.classList.remove(FORM_STATE.hidden);
        formContent.classList.add(FORM_STATE.hidden);
        respContent.textContent = '';
    });
}

initPhoneMask();
initImgHandler();
initFormHandler();
document.addEventListener('fetchit:after', handleResponse);