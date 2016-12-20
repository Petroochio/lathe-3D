import * as most from 'most';
import { h } from '@cycle/dom';
import isolate from '@cycle/isolate';

// Components
import MeshEntity from './MeshEntity';
import Camera from './Camera';

const sky = h('a-sky', { attrs: { color: '#000022' } });

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
  const mouseMove$ = editorDOM
    .events('mousemove')
    .map(mouseMoveProps);

  const intents = {
    mouseUp$,
    mouseDown$,
    mouseMove$,
    mouseLeave$,
    mouseWheel$,
  };
  return intents;
}

function model(actions) {
  return most.of({});
}

function view(state$) {
  return state$.map(entities =>
    h('section#editor',
      [
        h('a-scene', [...entities, sky]),
      ]
    )
  );
}

const Lathe = (sources) => {
  const { DOM } = sources;

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

  const actions = intent(sources);
  // const state$ = model();
  // This all goes in the model
  const camera$ = Camera({ ...sources, ...actions }).vdom$;
  const MeshEntity$ = isolate(MeshEntity)(sources, initialVerts).vdom$;
  const entities$ = most.combineArray(combineAllStreams, [camera$, MeshEntity$]);

  const vdom$ = view(entities$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
