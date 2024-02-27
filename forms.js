const FORM_SELECTORS = {
  form: ".js-form",
  inputHolder: ".js-input-holder",
  input: ".js-input-field",
  submitBtn: ".js-form-submit",
  errorContent: ".js-error-message",
  formContent: ".js-form-content",
  respContentSel: ".js-form-response",
  fieldset: ".js-form-fieldset",
  link: ".js-form-link",
  imgRemoveBtn: ".js-images-remove",
  imgInput: ".js-input-image",
};

const INPUT_CLASSNAMES = {
  phoneInput: "js-input-type-phone",
  emailInput: "js-input-type-email",
  defaultInput: "js-input-type-default",
  inputOptional: "js-optional",
};

const FORM_STATE = {
  error: "is-error",
  visible: "is-visible",
  hidden: "is-hidden",
};

const FORM_ERROR_MESSAGES = {
  formInvalid: "Поля формы заполнены неверно",
  phoneInvalid: "Неверно введен телефон",
  emailInvalid: "Неверно введен e-mail",
  textInvalid: "Недопустимые символы",
  inputEmpty: "Поле не может быть пустым",
  inputRequired: "Поле не может быть пустым",
  minLengthInvalid: "Слишком короткое значение",
  maxLengthInvalid: "Значение слишком длинное",
  imgTypeError: "Изображение не определено",
  imgSizeError: "Изображение превышает 2MB",
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
};

/**
 * Валидация телефона по длине, так как используется маска телефона
 * 18 - необходимое количество символов в маске телефона
 * @param phone
 * @return {boolean}
 */
const validatePhone = (phone) => {
  return !(phone[0] === '+' ? phone.length < 16 : phone.length < 15);
};

/**
 * Отображение описания ошибки поля при обработке формы
 * @param {HTMLElement} field - поле ввода
 * @param {string} message - текст ошибки
 */
const showErrorMessage = (field, message) => {
  field
    .closest(FORM_SELECTORS.inputHolder)
    .querySelector(FORM_SELECTORS.errorContent).textContent = message;
};

/**
 * Добавляет/убирает модификатор контейнеру поля ввода
 * @param {HTMLElement} field - поле ввода
 * @param {boolean} isValid - валидно ли значение поля по умолчанию
 */
const handleInputHolder = (field, isValid) => {
  const inputHolder = field.closest(FORM_SELECTORS.inputHolder);
  if (!inputHolder) console.log(field);
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
    ? [
        validateString(value) || value.length === 0,
        value.length > 1 || value.length === 0,
      ]
    : [validateString(value), value.length > 1];

  const incorrectCases = [!isValid, !isMinLength, value.length > 76];
  const errorMessages = [
    FORM_ERROR_MESSAGES.textInvalid,
    FORM_ERROR_MESSAGES.minLengthInvalid,
    FORM_ERROR_MESSAGES.maxLengthInvalid,
  ];

  if (value.length === 0 && !isInputOptional(input)) {
    showErrorMessage(input, FORM_ERROR_MESSAGES.inputRequired);
  } else {
    incorrectCases.forEach((item, index) => {
      if (item) showErrorMessage(input, errorMessages[index]);
    });
  }

  handleInputHolder(
    input,
    incorrectCases.some((item) => item)
  );

  return incorrectCases.filter((item) => item).length === 0;
};

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
    !(value.split('')[3] && Number(value.split('')[3]) === 9),
  ];
  const isValid = incorrectCases.some((item) => item);

  if (value.length === 0 && !isInputOptional(input)) {
    showErrorMessage(input, FORM_ERROR_MESSAGES.inputRequired);
  } else {
    incorrectCases.forEach((item) => {
      if (item) showErrorMessage(input, FORM_ERROR_MESSAGES.phoneInvalid);
    });
  }

  handleInputHolder(input, isValid);

  return isInputOptional(input)
    ? isValid && value.length === 0
    : incorrectCases.filter((item) => item).length === 0;
};

const validateField = (input, classList) => {
  const { phoneInput, emailInput, defaultInput } = INPUT_CLASSNAMES;

  if (classList.includes(defaultInput)) {
    return checkStringField(input);
  }

  if (classList.includes(phoneInput)) {
    return checkPhoneField(input);
  }
};

const changeInput = (arr) => {
  const isValidatedArr = arr.map((item) =>
    validateField(item, Array.from(item.classList))
  );

  return isValidatedArr.every((item) => item);
};

const handleInputs = (form) => {
  const { input: inputSel, submitBtn: submitBtnSel } = FORM_SELECTORS;
  const fieldsArr = Array.from(form.querySelectorAll(inputSel));
  const submitBtn = form.querySelector(submitBtnSel);
  submitBtn.disabled = true;

  fieldsArr.forEach((input, _, arr) =>
    input.addEventListener("input", () => {
      submitBtn.disabled = !changeInput(arr);
    })
  );
};

const handlePhoneInput = (input) => {
  const phoneMask = IMask(input, {
    mask: [
      {
        mask: '+7 000 000-00-00',
        startsWith: '7'
      },
      {
        mask: '+7 000 000-00-00',
        startsWith: '8'
      },
      {
        mask: '+7 000 000-00-00',
        startsWith: ''
      }
    ],
    dispatch: (appended, dynamicMasked) => {
      let number = (dynamicMasked.value + appended).replace(/\D/g,'');

      return dynamicMasked.compiledMasks.find(m => number.indexOf(m.startsWith) === 0);
    }
  });
};

const initPhoneMask = () => {
  const phoneInputsArr = Array.from(
    document.querySelectorAll('input[type="tel"]')
  );

  if (!phoneInputsArr.length) {
    return;
  }

  phoneInputsArr.forEach((input) => handlePhoneInput(input));
};

const initFormHandler = () => {
  const formsArr = Array.from(document.querySelectorAll(FORM_SELECTORS.form));

  if (!formsArr.length) {
    return;
  }

  formsArr.forEach((form) => handleInputs(form));
};

const unsetImgPreview = (imgRemoveBtn) => {
  if (!imgRemoveBtn) {
    return;
  }

  const clickEvent = new Event("click");

  imgRemoveBtn.dispatchEvent(clickEvent);
};

const handleResponse = (event) => {
  const { form, response } = event.detail;
  const {
    submitBtn: submitBtnSel,
    formContent: formContentSel,
    respContentSel: respContentSel,
    fieldset: fieldsetSel,
    imgRemoveBtn: imgRemoveBtnSel,
    link: linkSel,
  } = FORM_SELECTORS;
  const submitBtn = form.querySelector(submitBtnSel);
  const formContent = form.querySelector(formContentSel);
  const respContent = form.querySelector(respContentSel);
  const fieldset = form.querySelector(fieldsetSel);
  const imgRemoveBtn = form.querySelector(imgRemoveBtnSel);
  const link = form.querySelector(linkSel);

  respContent.textContent = response.message;
  formContent.classList.remove(FORM_STATE.hidden);

  if (response.success) {
    fieldset.classList.add(FORM_STATE.hidden);
    unsetImgPreview(imgRemoveBtn);
  } else {
    formContent.classList.add(FORM_STATE.error);
  }

  link.addEventListener("click", (event) => {
    event.preventDefault();
    submitBtn.disabled = true;
    fieldset.classList.remove(FORM_STATE.hidden);
    formContent.classList.add(FORM_STATE.hidden);
    respContent.textContent = "";
  });
};

initPhoneMask();
initFormHandler();
document.addEventListener("fetchit:after", handleResponse);
