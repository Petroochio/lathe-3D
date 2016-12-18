import { h } from '@cycle/dom';
import * as most from 'most';
import { T, F, nth } from 'ramda';

function renderCam(newAttr) {
  const defaultAttr = { camera: true, 'mouse-cursor': true };
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
  const isMouseDown$ = sources.mouseDown$
    .map(T)
    .merge(sources.mouseUp$.map(F))
    .merge(sources.mouseLeave$.map(F));

  const mouseDrag$ = isMouseDown$
    .combine((...streams) => streams, sources.mouseMove$)
    .filter(([isDown, _]) => isDown)
    .map(nth(1));

  const intents = {
    mouseDrag$,
  };
  return intents;
}

function model(actions) {
  const rotation$ = actions
    .mouseDrag$
    .scan(calcRotation, { xdeg: 0, ydeg: 0 });

  const state = {
    rotation$,
  };
  return state;
}

function view(state$) {
  return state$.map(rotation =>
    h(
      'a-entity#camera-x-container',
      { attrs: { rotation: `0 ${rotation.xdeg} 0` } },
      [
        h(
          'a-entity#camera-y-container',
          { attrs: { rotation: `${rotation.ydeg} 0 0` } },
          [renderCam({ position: '0 0 5' })]
        ),
      ]
    )
  );
}

function Camera(sources) {
  const actions = intent(sources);
  const state = model(actions);
  const vdom$ = view(state.rotation$);

  const sinks = {
    vdom$,
  };
  return sinks;
}

export default Camera;
