// @flow
// Aframe setup
import 'aframe';
import Cycle from '@cycle/xstream-run';
import Onionify from 'cycle-onionify';
import { makeDOMDriver } from '@cycle/dom';
import './aframe-addons';
// Main Component
import Lathe from './app';

const wrappedMain = Onionify(Lathe);
function makeDrivers() {
  const drivers = {
    DOM: makeDOMDriver('#root'),
  };
  return drivers;
}

window.onload = () => Cycle.run(wrappedMain, makeDrivers());
