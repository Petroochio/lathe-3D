import xs from 'xstream';
import { map, propEq, always } from 'ramda';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';

import { aScene, aSky } from './utils/AframeHyperscript';
import createKeyPress from './utils/CreateKeyPress';
// Components
import MeshEntity from './MeshEntity';
import MovementAnchor from './MovementAnchor';
import Camera from './Camera';

const sky = aSky({ attrs: { color: '#000022' } });
const initialVerts = [
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, 1, 1],
  [-1, -1, -1],
  [-1, -1, 1],
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
  const keyDown$ = sources.DOM.select('body').events('keydown');
  const keyUp$ = sources.DOM.select('body').events('keyup');

  const actions = {
    mouseUp$,
    mouseDown$,
    mouseMove$,
    mouseLeave$,
    mouseWheel$,
    keyDown$,
    keyUp$,
  };
  return actions;
}

function model(actions) {
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

  const state = {
    // meshReducer$: mesh.onion,
    // vertexPositions$: meshProp$,
    altKeyState$: createKeyPress('Alt', actions.keyDown$, actions.keyUp$),
    shiftKeyState$: createKeyPress('Shift', actions.keyDown$, actions.keyUp$),
    initialReducer$: xs.of(always({ verts: initialVerts })),
  };
  return state;
}

function view(state, children$) {
  return xs.combine(state.altKeyState$, children$)
    .map(([altKeyDown, children]) =>
    section(
      '#editor',
      { style: { cursor: `${altKeyDown ? 'move' : 'auto'}` } },
      [aScene([...children, sky])]
    )
  );
}

function Lathe(sources) {
  const { DOM } = sources;

  const actions = intent(sources);
  const state = model(actions);
  const { altKeyState$, shiftKeyState$ } = state;
  const camera = Camera({ DOM, altKeyState$, ...actions });

  // Proxy bisnuz for handlers
  const initialVerts$ = xs.from(initialVerts);
  // const totalVerts$ = xs.create();
  const vertCollection$ = initialVerts$; // xs.merge(initialVerts$, totalVerts$);

  const meshProp$ = vertCollection$;// .map(prop('verts'));
  const mesh = isolate(MeshEntity, 'Mesh')({
    ...sources,
    altKeyState$,
    shiftKeyState$,
    rootInput$: actions.mouseDown$,
    prop$: meshProp$,
  });

  const childVnodes$ = xs.combine(camera.DOM, mesh.DOM);
  const vdom$ = view(state, childVnodes$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default Lathe;
