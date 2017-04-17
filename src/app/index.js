// @flow
import xs from 'xstream';
import { prop, always } from 'ramda';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';

import { aScene, aSky } from './utils/AframeHyperscript';
// Components
import MeshEntity from './MeshEntity';
import MovementAnchor from './MovementAnchor';
import Camera from './Camera';

const sky = aSky({ attrs: { color: '#000022' } });
const initialVerts = [
  xs.of('1 1 1'),
  xs.of('1 1 -1'),
  xs.of('1 -1 1'),
  xs.of('1 -1 -1'),
  xs.of('-1 1 -1'),
  xs.of('-1 1 1'),
  xs.of('-1 -1 -1'),
  xs.of('-1 -1 1'),
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
  const { DOM, onion } = sources;
  const { mouseDown$ } = actions;
  const camera = Camera({ DOM, ...actions });
  const meshProp$ = onion.state$.debug().map(prop('verts'));
  const mesh = isolate(MeshEntity, 'Mesh')({ ...sources, rootMouseDown$: mouseDown$, prop$: meshProp$ });

  // temp anchor
  // const tempAchor = MovementAnchor(
  //   {
  //     DOM,
  //     rootMouseUp$: actions.mouseUp$,
  //     rootMouseMove$: actions.mouseMove$,
  //     prop$: xs.of({ position: [1.5, 0, 0], axis: 'x' }),
  //   }
  // );

  // const children$ = most.combineArray(combineAllStreams, [camera.DOM, mesh.DOM, tempAchor.DOM]);
  const children$ = xs.combine(camera.DOM, mesh.DOM); // xs.of([mesh.DOM]);

  const state = {
    children$,
    meshReducer$: mesh.onion,
    // vertexPositions$: meshProp$,
  };
  return state;
}

function view(state$) {
  return state$.map(children =>
    section(
      '#editor',
      [aScene([...children, sky])]
    )
  );
}

function Lathe(sources) {
  const actions = intent(sources);
  const state = model(sources, actions);
  const vdom$ = view(state.children$);

  const reducer$ = xs.merge(xs.of(always({ verts: initialVerts })), state.meshReducer$);

  const sinks = {
    DOM: vdom$,
    onion: reducer$,
  };
  return sinks;
}

export default Lathe;
