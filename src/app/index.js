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

  const actions = {
    mouseUp$,
    mouseDown$,
    mouseMove$,
    mouseLeave$,
    mouseWheel$,
  };
  return actions;
}

function model(sources, actions) {
  // const { mouseDown$ } = actions;

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
  // xs.of([mesh.DOM]);

  const reducers = {
    // meshReducer$: mesh.onion,
    // vertexPositions$: meshProp$,
    initialReducer$: xs.of(always({ verts: initialVerts })),
  };
  return reducers;
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
  const { DOM } = sources;

  const actions = intent(sources);
  const initialProps$ = xs.of({ verts: initialVerts });
  const camera = Camera({ DOM, ...actions });
  const meshProp$ = initialProps$.map(prop('verts'));
  const mesh = isolate(MeshEntity, 'Mesh')({ ...sources, rootMouseDown$: actions.mouseDown$, prop$: meshProp$ });

  const reducers = model(sources, actions);
  const reducer$ = xs.merge(reducers.initialReducer$, mesh.onion);

  const childVnodes$ = xs.combine(camera.DOM, mesh.DOM);
  const vdom$ = view(childVnodes$);

  const sinks = {
    DOM: vdom$,
    onion: reducer$,
  };
  return sinks;
}

export default Lathe;
