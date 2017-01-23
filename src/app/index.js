// @flow
import * as most from 'most';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';
import circulate from 'cycle-proxy/circulate/most';

import { aScene, aSky } from './utils/AframeHyperscript';
// Components
import MeshEntity from './MeshEntity';
import MovementAnchor from './MovementAnchor';
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

const initialVerts$ = most.of({ verts: initialVerts });

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
  const { DOM, verts$ } = sources;
  const { mouseDown$ } = actions;
  const camera = Camera({ DOM, ...actions });

  // const meshProp$ = most.merge(onion.state$, initialVerts$);
  const mesh = isolate(MeshEntity)({ DOM, rootMouseDown$: mouseDown$, prop$: verts$ });

  // temp anchor
  const tempAchor = MovementAnchor(
    {
      DOM,
      rootMouseUp$: actions.mouseUp$,
      rootMouseMove$: actions.mouseMove$,
      prop$: most.of({ position: [1.5, 0, 0], axis: 'x' }),
    }
  );

  const children$ = most.combineArray(combineAllStreams, [camera.DOM, mesh.DOM, tempAchor.DOM]);

  const state = {
    children$,
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

  const sinks = {
    DOM: vdom$,
    verts$: initialVerts$, // most.merge(initialVerts$, state.vertexPositions$),
  };
  return sinks;
}

export default circulate(Lathe, 'verts$');
