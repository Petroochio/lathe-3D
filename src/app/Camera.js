import { h } from '@cycle/dom';
import * as most from 'most';

function renderCam(newAttr) {
  const defaultAttr = { camera: true, 'mouse-cursor': true };
  return h('a-entity', { attrs: { ...defaultAttr, ...newAttr } });
}

function intent(sources) {
  const mouseMove$ = sources.DOM
    .select('body')
    .events('mousemove');

  const intents = {
    mouseMove$,
  };
  return intents;
}

function model(intents) {
  return most.of({});
}

function view(state$) {
  return state$.map(props =>
    h(
      'a-entity.camera-container',
      { attrs: { rotation: props.rotation } },
      [renderCam({ position: '0 0 5' })]
    )
  );
}

function Camera(sources) {
  const state$ = most.of({ rotation: '0 45 0' });
  const vdom$ = view(state$);

  const sinks = {
    vdom$,
  };
  return sinks;
}

export default Camera;
