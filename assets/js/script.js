'use strict';
let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let smallLetters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];
let capitalLetters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
let basicspecialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];

// DOM Elements
let elMessage = document.querySelector('.gen-message');
let elGeneratedPassword = document.getElementById('generated-password');
let elCopyButton = document.querySelector('button.copy');
let elSelectType = document.getElementById('select-type');
let elSelectPassword = document.getElementById('select-password');
let elSelectPassPhrase = document.getElementById('select-passphrase');
let elPasswordForm = document.getElementById('password-form');
let elPassPhraseForm = document.getElementById('passphrase-form');
let elTotalChars = document.getElementById('total-chars');
let elResult = document.querySelector('.result');
let elTotalWords = document.getElementById('total-words');

let _ = undefined;

// Select Password as the type on load.
elSelectPassword.checked = true;

// Reset Start time to manage Maximum Pass to be generated in a min
let startTime = new Date().getTime();
let totalPassGenerated = 1;
const resetTime = () => {
  setInterval(() => {
    startTime = new Date().getTime();
    totalPassGenerated = 1;
  }, 60000);
};

// Add/Remove loading notification
const checkIfLoadingResults = function () {
  if (document.querySelector('.loading')) {
    document.querySelector('.loading').remove();
  } else {
    const element = document.createElement('p');
    element.classList.add('loading');
    element.innerText = `Loading...`;
    elResult.insertAdjacentElement('beforebegin', element);
  }
};

const maxPassPerMin = function (startTime, totalPassGenerated, limit) {
  if (new Date().getTime() - startTime < 60000 && totalPassGenerated > limit) {
    return true;
  }
};

const updateCSS = function (element = [], toggle, add, remove) {
  element.forEach(el => {
    toggle ? el.classList.toggle(toggle) : '';
    remove ? el.classList.remove(remove) : '';
    add ? el.classList.add(add) : '';
  });
};

// Reset all values on toggling type
const reset = function () {
  updateCSS([elResult, elPassPhraseForm, elPasswordForm], _, 'hidden', _);
  elSelectPassPhrase.checked = elSelectPassword.checked = false;
  totalPassGenerated = 1;
};

const toggleChecked = function (e) {
  reset();
  if (e.srcElement === elSelectPassword) {
    elSelectPassword.checked = true;
    updateCSS([elPasswordForm], _, _, 'hidden');
  }
  if (e.srcElement === elSelectPassPhrase) {
    elSelectPassPhrase.checked = true;
    updateCSS([elPassPhraseForm], _, _, 'hidden');
  }
};

const displayResults = function (
  secret,
  successMessage1,
  successMessage2,
  failureMessage
) {
  try {
    if (secret) {
      totalPassGenerated++;
      updateCSS(
        [elResult, elCopyButton, elGeneratedPassword, elMessage],
        _,
        _,
        'hidden'
      );
      updateCSS([elMessage], _, 'success', 'error');
      elGeneratedPassword.innerText = secret;
      if (navigator.clipboard.writeText(secret)) {
        elMessage.innerText = successMessage1;
      } else {
        elMessage.innerText = successMessage2;
      }
    } else {
      updateCSS([elGeneratedPassword, elCopyButton], _, 'hidden', _);
      updateCSS([elMessage, elResult], _, _, 'hidden');
      updateCSS([elMessage], _, 'error', 'success');
      elMessage.innerText = failureMessage;
    }
    setTimeout(() => {
      updateCSS([elMessage], _, 'hidden', _);
      if (!secret) {
        updateCSS([elResult], _, 'hidden', _);
      }
    }, 4000);
  } catch (error) {
    console.table(error);
  }
};

/**
 * Handle PassPhrase generation
 */

// Fetch random words from an API
// https://github.com/RazorSh4rk/random-word-api#random-word-api
const getRandomWords = function (words = 15) {
  const url = `https://random-word-api.herokuapp.com/word?number=${words}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      displayResults(
        _,
        _,
        _,
        `Could not fetch PassPhrase words from API. 
      ${error}
      Please try generating a new Password instead.`
      );
    });
};

const triggerPassPhraseGenerator = async function (event) {
  let totalWords = 15;
  event.preventDefault();
  checkIfLoadingResults();
  if (Number(elTotalWords.value) && elTotalWords.value != 15) {
    totalWords = elTotalWords.value;
  }
  if (maxPassPerMin(startTime, totalPassGenerated, 3)) {
    checkIfLoadingResults();
    displayResults(
      _,
      _,
      _,
      `PassPhrase generation limited to 3 per minute to reduce load on the free API. Please try again later.`
    );
    return;
  }
  if (totalWords > 50 || totalWords < 9) {
    checkIfLoadingResults();
    displayResults(
      _,
      _,
      _,
      'PassPhrase not Generated. Please include between 12 to 50 words'
    );
    return;
  }
  await getRandomWords(totalWords).then(data => {
    checkIfLoadingResults();
    displayResults(
      data.join(' '),
      'New Random PassPhrase Generated & Copied to ClipBoard ✅',
      'New Random PassPhrase Generated. Please click copy button to copy to clipboard',
      'PassPhrase not Generated. Please try to Generate Password'
    );
  });
};

/**
 * Handle Password generation
 */

const gernerateRandomPassword = function (totalCharacters, value = []) {
  let generatedPassword = '';
  if (value.length > 8 && totalCharacters > 5) {
    for (let index = 0; index < totalCharacters; index++) {
      generatedPassword += value[Math.floor(Math.random() * value.length)];
    }
    return generatedPassword;
  } else {
    return false;
  }
};

const triggerPasswordGenerator = function (event) {
  event.preventDefault();
  let pass;
  let count = 0;
  let totalCharacters = 25;
  let selectedArray = [];

  // Total characters taken from the form if it is not set to 25
  if (Number(elTotalChars.value) && elTotalChars.value != 25) {
    totalCharacters = elTotalChars.value;
  }
  if (document.getElementById('numbers').checked) {
    selectedArray = selectedArray.concat(numbers);
    count++;
  }
  if (document.getElementById('small-letters').checked) {
    selectedArray = selectedArray.concat(smallLetters);
    count++;
  }
  if (document.getElementById('capital-letters').checked) {
    selectedArray = selectedArray.concat(capitalLetters);
    count++;
  }
  if (document.getElementById('special-characters').checked) {
    selectedArray = selectedArray.concat(basicspecialChars);
    count++;
  }
  if (totalCharacters < 6 || totalCharacters > 250) {
    totalCharacters = 25;
    elTotalChars.value = 25;
    displayResults(
      _,
      _,
      _,
      'Password not Generated. Please enter a valid number between 6 to 250 characters'
    );
    return;
  }
  if (count < 2) {
    displayResults(
      _,
      _,
      _,
      'Password not Generated. Please include at least two types of Characters'
    );
    return;
  }
  pass = gernerateRandomPassword(totalCharacters, selectedArray);
  displayResults(
    pass,
    'New Random Password Generated & Copied to ClipBoard ✅',
    'New Random Password Generated. Please click copy button to copy to clipboard',
    'Password not Generated. Please include at least one type, and a minimum of 6 characters ❌'
  );
};

/**
 * Event Listeners
 */

addEventListener('load', resetTime);

elSelectPassPhrase.addEventListener('click', toggleChecked);
elSelectPassword.addEventListener('click', toggleChecked);

document
  .getElementById('submit-password')
  .addEventListener('click', triggerPasswordGenerator);

document
  .getElementById('submit-passphrase')
  .addEventListener('click', triggerPassPhraseGenerator);

// Copy button in case the auto copy fails, or you need to copy the generated pass again for some reason.
elCopyButton.addEventListener('click', function () {
  if (navigator.clipboard.writeText(elGeneratedPassword.innerText)) {
    elCopyButton.innerText = 'Copied!';
    setTimeout(() => {
      elCopyButton.innerText = 'Copy';
    }, 2500);
  }
});
