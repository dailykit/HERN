export const validatorFunc = {
  text: (value) => {
    const text = value.trim();
    let isValid = true;
    let errors = [];
    if (text.length < 1) {
      isValid = false;
      errors = [...errors, "Cannot be empty!"];
    }
    return { isValid, errors };
  },
  priority: (value) => {
    let isValid = true;
    let errors = [];
    if (!value) {
      isValid = false;
      errors = [...errors, "Cannot be empty or Invalid Input!"];
    }
    if (+value <= 0 && value !== "") {
      isValid = false;
      errors = [...errors, "Should be greater than 0!"];
    }
    return { isValid, errors };
  },
  number: (value) => {
    let isValid = true;
    let errors = [];
    if (!value) {
      isValid = false;
      errors = [...errors, "Cannot be empty or Invalid Input!"];
    }
    if (+value <= 0 && value !== "") {
      isValid = false;
      errors = [...errors, "Should be greater than 0!"];
    }
    return { isValid, errors };
  },
  percentage: (value) => {
    let isValid = true;
    let errors = [];
    if (!value) {
      isValid = false;
      errors = [...errors, "Cannot be empty!"];
    }
    if (+value <= 0 && value !== "") {
      isValid = false;
      errors = [...errors, "Should be greater than 0!"];
    }
    if (!Number.isInteger(+value) || +value < 0) {
      isValid = false;
      errors = [...errors, "Invalid value!"];
    }
    return { isValid, errors };
  },
};

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
