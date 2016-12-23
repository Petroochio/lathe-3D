import isolate from '@cycle/isolate';
import { prop, map } from 'ramda';
import * as most from 'most';

import { aEntity } from './utils/AframeHyperscript';
import VertexNode from './VertexNode';

function combineAllStreams(...values) {
  return values;
}

const faces = [
  '0 2 1',
  '2 3 1',
  '4 6 5',
  '6 7 5',
  '4 5 1',
  '5 0 1',
  '7 6 2',
  '6 3 2',
  '5 7 0',
  '7 2 0',
  '1 3 4',
  '3 6 4',
];

function renderMesh(state, vertexNodes) {
  return aEntity(
    {
      attrs: {
        material: 'color: #222222; flatShading: true;',
        geometry: `primitive: editable; faces: ${faces.join(',')}; vertices: ${state.verts.join(',')};`,
        position: '0 0 0',
      },
    },
    vertexNodes,
  );
}

function model(sources) {
  const { props, DOM } = sources;
  const vertexNodes = props
    .initialVerts
    .map(v => isolate(VertexNode)(sources, v));

  const vertexDoms = vertexNodes.map(prop('vdom$'));
  const vertexStates = vertexNodes.map(prop('state$'));

  const vertexState$ = most
    .combineArray(combineAllStreams, vertexStates)
    .map(map(prop('position')))
    .map(verts => ({ verts }));

  const vertexDom$ = most.combineArray(combineAllStreams, vertexDoms);
  const state = {
    vertexState$,
    vertexDom$,
  };
  return state;
}

function view(state) {
  return state.vertexState$.combine(renderMesh, state.vertexDom$);
}

// Add some sweet flow type checking for props :3
function MeshEntity(sources) {
  const state = model(sources);
  const vdom$ = view(state);
  const sinks = {
    vdom$,
  };
  return sinks;
}

export default MeshEntity;
