// Aframe setup
import 'aframe';
import Cycle from '@cycle/xstream-run';
import { makeDOMDriver } from '@cycle/dom';
import makeLocalStorageDriver from './drivers/LocalStorage';
import './aframe-addons';
// Main Component
import Lathe from './app';

function makeDrivers() {
  const drivers = {
    DOM: makeDOMDriver('#root'),
    storage: makeLocalStorageDriver(),
  };
  return drivers;
}

window.onload = () => Cycle.run(Lathe, makeDrivers());
