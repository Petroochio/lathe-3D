import * as most from 'most';
import { h } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { prop, map } from 'ramda';

// Components
import ModelEntity from './ModelEntity';
import Camera from './Camera';

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
  return state$.map(entities =>
    h('section',
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

  // const action$ = intent(sources);
  // const state$ = model();
  const ModelEntity$ = isolate(ModelEntity)(sources, initialVerts).vdom$;
  const camera$ = Camera(sources).vdom$;
  const entities$ = most.combineArray(combineAllStreams, [camera$, ModelEntity$]);

  const vdom$ = view(entities$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
