import { h } from '@cycle/dom';
import { T, F, nth, pick, prop, clamp } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';

function renderCam(newAttr) {
  const defaultAttr = { camera: true, 'mouse-events': true };
  return h('a-entity', { attrs: { ...defaultAttr, ...newAttr } });
}

function calcRotation(oldRot, deltaRot) {
  const newRot = {
    xdeg: oldRot.xdeg - (deltaRot.dx / 10),
    ydeg: oldRot.ydeg - (deltaRot.dy / 10),
  };
  return newRot;
}

function intent(sources) {
  const isMouseDown$ = sources
    .mouseDown$
    .map(T) // Map to True
    .merge(sources.mouseUp$.map(F)) // Map to False
    .merge(sources.mouseLeave$.map(F)); // Map to False

  const mouseDrag$ = isMouseDown$
    .combine((...streams) => streams, sources.mouseMove$)
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

function model(actions) {
  const rotation$ = actions
    .mouseDrag$
    .scan(calcRotation, { xdeg: 0, ydeg: 0 });

  const zoom$ = actions
    .mouseWheel$
    .map(prop('deltaY'))
    .scan((zoom, dZoom) => clamp(2, Infinity)(zoom - (dZoom / 50)), 5);

  const state = {
    rotation$,
    zoom$,
  };
  return state;
}

function view(state) {
  const state$ = state
    .rotation$
    .combine((rot, zoom) => ({ rot, zoom }), state.zoom$);

  return state$.map(s =>
    aEntity(
      '#camera-x-container',
      { attrs: { rotation: `0 ${s.rot.xdeg} 0` } },
      [
        aEntity(
          '#camera-y-container',
          { attrs: { rotation: `${s.rot.ydeg} 0 0` } },
          [renderCam({ position: `0 0 ${s.zoom}` })]
        ),
      ]
    )
  );
}

function Camera(sources) {
  const actions = intent(sources);
  const state = model(actions);
  const vdom$ = view(state);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default Camera;
