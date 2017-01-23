// @flow
// Aframe setup
import 'aframe';
import Cycle from '@cycle/most-run';
import Onionify from 'cycle-onionify';
import { makeDOMDriver } from '@cycle/dom';
import './aframe-addons';
// Main Component
import App from './app';

const wrappedMain = Onionify(App);
function makeDrivers() {
  const drivers = {
    DOM: makeDOMDriver('#root'),
  };
  return drivers;
}

window.onload = () => Cycle.run(wrappedMain, makeDrivers());
