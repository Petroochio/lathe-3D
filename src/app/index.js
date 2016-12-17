import * as most from 'most';
import { h } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { prop, map } from 'ramda';

// Components
import ModelEntity from './ModelEntity';

const sky = h('a-sky', { attrs: { color: '#000022' } });

function combineAllStreams(...values) {
  return values;
}

function intent(sources) {
  return most.of({});
}

function model(actions) {
  return most.of({});
}

function view(state$) {
  return state$.map(mesh =>
    h('section',
      [
        h('a-scene', [mesh, sky]),
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

  // const action$ = intent(sources);
  // const state$ = model();
  const ModelEntity$ = isolate(ModelEntity)(sources, initialVerts).vdom$;
  // const entities$ = most.combineArray(combineAllStreams, [...vertexDoms, ModelEntity$]);

  const vdom$ = view(ModelEntity$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
