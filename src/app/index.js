import xs from 'xstream';
import { section } from '@cycle/dom';
import isolate from '@cycle/isolate';
import {
  compose, length, filter, lte, join,
  map, mean, prop, split, transpose
} from 'ramda';

import { aScene, aSky } from './utils/AframeHyperscript';
import createKeyPress from './utils/CreateKeyPress';
// Components
import MeshEntity from './MeshEntity';
import TranslateAnchorGroup from './TranslateAnchorGroup';
import Camera from './Camera';

const sky = aSky({ attrs: { color: '#f5f5f5' } });
const cubeVerts = [
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
  const { DOM, storage } = sources;
  const meshStateProxy$ = xs.create();

  const actions = intent(sources);
  const state = model(actions);
  const { altKeyState$, shiftKeyState$ } = state;
  const camera = Camera({ DOM, altKeyState$, ...actions });

  // Proxy bisnuz for handlers
  // Should all of this be in the movement anchor? probs
  const selectedVerts$ = meshStateProxy$.map(filter(prop('isSelected')));
  const hasSelectedVerts$ = selectedVerts$.map(compose(lte(1), length));
  const movementAnchorPosition$ = selectedVerts$
    .filter(compose(lte(1), length))
    .map(map(prop('position')))
    .map(compose(map(mean), transpose))
    .startWith([0, 0, 0]);
  const movementAnchorProp$ = xs.combine(hasSelectedVerts$, movementAnchorPosition$)
    .map(([isVisible, position]) => ({ isVisible, position }));

  const initialVerts$ = storage.loadData('mesh')
    .map(mesh => (mesh ? compose(map(split(' ')), split(','))(mesh) : cubeVerts))
    .map(xs.fromArray)
    .flatten();
  const vertCollection$ = initialVerts$; // xs.merge(initialVerts$, totalVerts$);

  const translateAnchor = TranslateAnchorGroup({
    DOM,
    cameraRotation$: camera.rotation$,
    rootMouseUp$: actions.mouseUp$,
    rootMouseMove$: actions.mouseMove$,
    prop$: movementAnchorProp$,
  });

  const meshProp$ = vertCollection$;
  const mesh = isolate(MeshEntity, 'Mesh')({
    ...sources,
    altKeyState$,
    shiftKeyState$,
    anchorUpdate$: translateAnchor.update$,
    anchorHoldState$: translateAnchor.holdState$,
    rootInput$: actions.mouseDown$,
    prop$: meshProp$,
  });
  meshStateProxy$.imitate(mesh.meshState$);

  const saveState$ = meshStateProxy$
    .map(map(prop('position')))
    .map(compose(join(','), map(join(' '))))
    .map(value => ({ key: 'mesh', value }));

  const childVnodes$ = xs.combine(camera.DOM, mesh.DOM, translateAnchor.DOM);
  const vdom$ = view(state, childVnodes$);

  const sinks = {
    DOM: vdom$,
    storage: saveState$,
  };
  return sinks;
}

export default Lathe;
