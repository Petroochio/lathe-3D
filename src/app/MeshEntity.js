// @flow
import isolate from '@cycle/isolate';
import { prop, map } from 'ramda';
import * as most from 'most';
// import MovementAnchor from './MovementAnchor';

import { aEntity } from './utils/AframeHyperscript';

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


function renderVert(position) {
  return aEntity(
    '.vertex-node',
    {
      attrs: {
        geometry: 'primitive: sphere; radius: 0.05; segmentsWidth: 10; segmentsHeight: 10;',
        material: 'flatShading: true; color: #aaaaff',
        position,
      },
    }
  );
}

function renderMesh(state) {
  const { verts } = state;
  return aEntity(
    '.edit-mesh',
    {
      attrs: {
        material: 'color: #222222; flatShading: true;',
        geometry: `primitive: editable; faces: ${faces.join(',')}; vertices: ${verts.join(',')};`,
        position: '0 0 0',
      },
    },
    verts.map(renderVert),
  );
}

function view(state$) {
  return state$.map(renderMesh);
}

function MeshEntity(sources) {
  const vdom$ = view(sources.prop$);
  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default MeshEntity;
