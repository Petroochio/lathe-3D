// Aframe setup
import 'aframe';
import Cycle from '@cycle/xstream-run';
import { makeDOMDriver } from '@cycle/dom';
import './aframe-addons';
// Main Component
import Lathe from './app';

function makeDrivers() {
  const drivers = {
    DOM: makeDOMDriver('#root'),
  };
  return drivers;
}

window.onload = () => Cycle.run(Lathe, makeDrivers());
