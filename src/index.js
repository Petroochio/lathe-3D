// Aframe setup
import 'aframe';
import Cycle from '@cycle/most-run';
import { makeDOMDriver } from '@cycle/dom';
import './aframe-addons';
// Main Component
import App from './app';

const main = App;
function makeDrivers() {
  const drivers = {
    DOM: makeDOMDriver('#root'),
  };
  return drivers;
}

window.onload = () => Cycle.run(main, makeDrivers());
