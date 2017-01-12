import * as most from 'most';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';

import { aScene, aSky } from './utils/AframeHyperscript';
// Components
import MeshEntity from './MeshEntity';
import Camera from './Camera';

const sky = aSky({ attrs: { color: '#000022' } });
const initialVerts = [
  '1 1 1',
  '1 1 -1',
  '1 -1 1',
  '1 -1 -1',
  '-1 1 -1',
  '-1 1 1',
  '-1 -1 -1',
  '-1 -1 1',
];

function combineAllStreams(...values) {
  return values;
}

function mouseMoveProps({ movementX, movementY }) {
  return {
    dx: movementX,
    dy: movementY,
  };
}

function intent(sources) {
  const editorDOM = sources.DOM.select('#editor');
  const mouseUp$ = editorDOM.events('mouseup');
  const mouseLeave$ = editorDOM.events('mouseleave');
  const mouseDown$ = editorDOM.events('mousedown');
  const mouseWheel$ = editorDOM.events('mousewheel');
  const mouseMove$ = editorDOM.events('mousemove').map(mouseMoveProps);

  const intents = {
    mouseUp$,
    mouseDown$,
    mouseMove$,
    mouseLeave$,
    mouseWheel$,
  };
  return intents;
}

function model(sources, actions) {
  const { DOM } = sources;
  const { mouseDown$ } = actions;
  const camera = Camera({ DOM, ...actions });
  const meshProps = { initialVerts };
  const mesh = isolate(MeshEntity)({ DOM, rootMouseDown$: mouseDown$, props: meshProps });

  const entities$ = most.combineArray(combineAllStreams, [camera.DOM, mesh.DOM]);

  const state = {
    entities$,
  };
  return state;
}

function view(state$) {
  return state$.map(entities =>
    section(
      '#editor',
      [aScene([...entities, sky])]
    )
  );
}

function Lathe(sources) {
  const actions = intent(sources);
  const state = model(sources, actions);
  const vdom$ = view(state.entities$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default Lathe;
