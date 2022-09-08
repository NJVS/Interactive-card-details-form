document.addEventListener('DOMContentLoaded', () => {
  // SUBMIT EVENT: form submit
  document.querySelector('form#cardInfo').addEventListener('submit', event => {
    event.preventDefault();

    validateForm(new FormData(event.target))
      .then(data => {
        // data.forEach((value, id) => updateCard(id, value));

        // add "resolve" class
        document.querySelector('section.form-container').classList.add('resolved');
      })
      .catch(inputs => inputs.forEach(inp => highlightInvalidInput(inp)));
  });


  // INPUT EVENT: all input
  document.querySelectorAll('#cardInfo input:not([type=submit])').forEach(elem => elem.addEventListener('input', event => {
    // real-time update (inp_cardNumber does more, than other inputs)
    if (event.target.id === 'inp_cardNumber') {
      // auto format (add space every 4 characters)
      event.target.value = event.target.value.replace(/(\s+)/g, '').replace(/(.{4})/g, '$& ').trim();

      // update card with padding
      let _value = event.target.value.replace(/(\s+)/g, '');  // remove spaces
      _value = String(_value).padStart(16, '0');              // add padding
      _value = _value.replace(/(.{4})/g, '$& ').trim();       // add spaces every 4 char
      updateCard('inp_cardNumber', _value);
    } else {
      updateCard(event.target.id, event.target.value);
    }

    // remove error message when user input new value
    resetInput(event.target);
  }));

  // BLUR EVENT: input card date autocomplete (check min/max and add padding)
  [
    document.querySelector('#inp_cardDateMonth'),
    document.querySelector('#inp_cardDateYear')
  ].forEach(input => input.addEventListener('blur', () => {
    let value = input.value;

    // do nothing if input value is empty
    if (value === '') return;

    // adjust value if it exceed the maxvalue or if less than the minvalue
    const maxVal = parseInt(input.getAttribute('max'));
    const minVal = parseInt(input.getAttribute('min'));
    value = (value > maxVal) ? maxVal : (value <= minVal) ? minVal : value; 
    
    // add value padding on start based on required length:
    // reqLength(2) 1  => 01
    // reqLength(2) 10 => 10
    // reqLength(3) 1  => 001
    // reqLength(3) 10 => 010
    const reqLength = input.getAttribute('maxlength');
    value = String(value).padStart(reqLength, '0');

    // update input value
    input.value = value;
    // update card
    updateCard(input.id, value);
  }));


  // CLICK EVENT: add more card
  document.querySelector('#addMoreCard').addEventListener('click', () => {
    // remove resolved class
    document.querySelector('section.form-container').classList.remove('resolved');

    // empty all input
    document.querySelectorAll('form#cardInfo input').forEach(inp => {
      if (inp.getAttribute('type') !== 'submit') inp.value = '';
    });
  });
});



///// FNs
function validateForm(formData) {
  return new Promise((resolve, reject) => {
    const invalidInputs = [];
    
    // rules (add if statement to add new rule)
    for (const [id, value] of formData) {
      const input = document.querySelector(`#${id}`);
      const reqLength = input.getAttribute('maxlength');
      const pattern = new RegExp(input.pattern);

      // check blank input
      if (value === '') {
        invalidInputs.push( {id: id, msg: "Can't be blank"} );
      }
      // required length (maxlength input attribute)
      else if (value.length != reqLength && reqLength !== null) {
        invalidInputs.push( {id: id, msg: `Must have ${(id === 'inp_cardNumber') ? 16 : reqLength} characters`} );
      }
      // required pattern 
      else if ( !pattern.test((id === 'inp_cardNumber') ? value.replace(/(\s+)/g, '') : value) ) {
        invalidInputs.push( {id: id, msg: `Wrong format`} );
      }
    }

    // if there were no invalid input, resolve promise end pass formData, 
    // else reject and pass invalid input 
    if (invalidInputs.length === 0) {
      resolve(formData);
    } else {
      reject(invalidInputs);
    }
  });
}

function updateCard(id, value) {
  const defaultVal = {
    inp_cardHolder: 'Jane Appleseed',
    inp_cardNumber: '0000 0000 0000 0000',
    inp_cardDateMonth: '00',
    inp_cardDateYear: '00',
    inp_cardCvc: '000'
  };

  document.querySelector(`#${id.replace(/inp_/g, '')}`).innerHTML = (value !== '') ? value : defaultVal[id];
}

function highlightInvalidInput(attr) {
  const input = document.querySelector(`#${attr.id}`);
  const formGroup = input.closest('.form-group');
  const errorMsg = document.createElement('p');
  errorMsg.className = 'error-message';
  errorMsg.innerHTML = attr.msg;

  // remove existing error message
  formGroup.querySelectorAll('.error-message').forEach(e => e.remove());

  // add "invalid" class on input
  input.classList.add('invalid');
  // append error message
  formGroup.append(errorMsg);
} 

function resetInput(input) {
  if (input.classList.contains('invalid')) {
    const formGroup = input.closest('.form-group');
  
    // incase there's morethan one input inside "form-group"
    formGroup.querySelectorAll('input').forEach(e => e.classList.remove('invalid'));
    // remove error message
    formGroup.querySelector('.error-message').remove();
  }
}