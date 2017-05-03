import { h } from '@cycle/dom';
import xs from 'xstream';
import { nth, pick, prop, propEq, clamp } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';

function renderCam(newAttr) {
  const defaultAttr = { camera: true, 'mouse-events': true };
  return h('a-entity', { attrs: { ...defaultAttr, ...newAttr } });
}

function calcRotation(oldRot, deltaRot) {
  const newRot = {
    xdeg: (oldRot.xdeg - (deltaRot.dx / 10)) % 360,
    ydeg: (oldRot.ydeg - (deltaRot.dy / 10)) % 360,
  };
  return newRot;
}

function intent(sources) {
  const mouseFalse$ = xs.merge(
    sources.mouseUp$.mapTo(false),
    sources.mouseLeave$.mapTo(false)
  );
  const isMouseDown$ = xs.merge(
    sources.mouseDown$.mapTo(true),
    mouseFalse$
  );

  const mouseDrag$ = xs.combine(isMouseDown$, sources.mouseMove$)
    .filter(([isDown]) => isDown)
    .map(nth(1));

  const mouseWheel$ = sources
    .mouseWheel$
    .map(pick(['deltaX', 'deltaY']));

  const intents = {
    mouseDrag$,
    mouseWheel$,
  };
  return intents;
}

function model(actions, sources) {
  const rotation$ = xs.combine(actions.mouseDrag$, sources.altKeyState$)
    .filter(nth(1))
    .map(nth(0))
    .fold(calcRotation, { xdeg: 0, ydeg: 0 }).debug();

  const zoom$ = xs.combine(actions.mouseWheel$, sources.altKeyState$)
    .filter(nth(1))
    .map(nth(0))
    .map(prop('deltaY'))
    .fold((zoom, dZoom) => clamp(2, Infinity)(zoom - (dZoom / 50)), 5);

  const state = {
    rotation$,
    zoom$,
  };
  return state;
}

function view(state) {
  const state$ = xs.combine(state.rotation$, state.zoom$);

  return state$.map(([rot, zoom]) =>
    aEntity(
      '#camera-x-container',
      { attrs: { rotation: `0 ${rot.xdeg} 0` } },
      [
        aEntity(
          '#camera-y-container',
          { attrs: { rotation: `${rot.ydeg} 0 0` } },
          [renderCam({ position: `0 0 ${zoom}` })]
        ),
      ]
    )
  );
}

function Camera(sources) {
  const actions = intent(sources);
  const state = model(actions, sources);
  const vdom$ = view(state);

  const sinks = {
    rotation$: state.rotation$,
    DOM: vdom$,
  };
  return sinks;
}

export default Camera;
