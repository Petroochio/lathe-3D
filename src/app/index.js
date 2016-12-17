import * as most from 'most';
import { h } from '@cycle/dom';
import { prop, map } from 'ramda';

// Components
import ModelEntity from './ModelEntity';
import VertexNode from './VertexNode';

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

  // Isolate these
  const vertexNodes = [
    VertexNode(sources, '1 1 1'),
    VertexNode(sources, '1 1 -1'),
    VertexNode(sources, '1 -1 1'),
    VertexNode(sources, '1 -1 -1'),
    VertexNode(sources, '-1 1 -1'),
    VertexNode(sources, '-1 1 1'),
    VertexNode(sources, '-1 -1 -1'),
    VertexNode(sources, '-1 -1 1'),
  ];
  const vertexDoms = vertexNodes.map(prop('vdom$'));
  const vertexStates = vertexNodes.map(prop('state$'));

  const vertexState$ = most.combineArray(combineAllStreams, vertexStates)
    .map(map(prop('position')))
    .map(verts => ({ verts }));

  // const action$ = intent(sources);
  // const state$ = model();
  const ModelEntity$ = ModelEntity({ prop$: vertexState$ }).vdom$;
  const entities$ = most.combineArray(combineAllStreams, [...vertexDoms, ModelEntity$]);

  const vdom$ = view(entities$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
