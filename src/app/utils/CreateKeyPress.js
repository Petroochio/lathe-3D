import xs from 'xstream';
import { propEq } from 'ramda';

function createKeyPress(key, keyDown$, keyUp$) {
  const isKey = propEq('key', key);
  const thisKeyDown$ = keyDown$
    .filter(isKey)
    .mapTo(true);

  const thisKeyUp$ = keyUp$
    .filter(isKey)
    .mapTo(false);

  const keyState$ = xs.merge(thisKeyDown$, thisKeyUp$).startWith(false);
  return keyState$;
}

export default createKeyPress;
