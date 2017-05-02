import xs from 'xstream';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';
import {
  always, compose, length, filter, lte,
  map, mean, prop, transpose
} from 'ramda';

import { aScene, aSky } from './utils/AframeHyperscript';
import createKeyPress from './utils/CreateKeyPress';
// Components
import MeshEntity from './MeshEntity';
import MovementAnchorGroup from './MovementAnchorGroup';
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
  const state = {
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
  const meshStateProxy$ = xs.create();

  const actions = intent(sources);
  const state = model(actions);
  const { altKeyState$, shiftKeyState$ } = state;
  const camera = Camera({ DOM, altKeyState$, ...actions });

  // Proxy bisnuz for handlers
  const movementAnchorProp$ = meshStateProxy$
    .map(filter(prop('isSelected')))
    .filter(compose(lte(1), length))
    .map(map(prop('position')))
    .map(compose(map(mean), transpose))
    .startWith([0, 0, 0]);

  const initialVerts$ = xs.fromArray(initialVerts);
  const vertCollection$ = initialVerts$; // xs.merge(initialVerts$, totalVerts$);

  const movementAnchor = MovementAnchorGroup({
    DOM,
    rootMouseUp$: actions.mouseUp$,
    rootMouseMove$: actions.mouseMove$,
    prop$: movementAnchorProp$,
  });

  const meshProp$ = vertCollection$;
  const mesh = isolate(MeshEntity, 'Mesh')({
    ...sources,
    altKeyState$,
    shiftKeyState$,
    anchorUpdate$: movementAnchor.update$,
    anchorHoldState$: movementAnchor.holdState$,
    rootInput$: actions.mouseDown$,
    prop$: meshProp$,
  });
  meshStateProxy$.imitate(mesh.meshState$);

  const childVnodes$ = xs.combine(camera.DOM, mesh.DOM, movementAnchor.DOM);
  const vdom$ = view(state, childVnodes$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default Lathe;
