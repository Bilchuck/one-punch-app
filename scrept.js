const query = queryString => document.querySelectorAll(queryString);
const getPasswords = _ => query('input[type=password]');
const KEYCODES = {
  ENTER: 13,
}

const onPageStart = () => {
  passWatcher();
}

const passWatcher = () => {
  const paswords = getPasswords();
  if (paswords.length === 0) {
    return;
  }
  const handler = consoleHandler;

  onButtonClicks(handler);
  onFormSubmits(handler);
  onEnterPressed(handler);
}

const consoleHandler = _ => {
  console.log('consoleHandler:strart');
  console.log('newEvent');
  console.log('consoleHandler:end');
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

module.export = { onPageStart };