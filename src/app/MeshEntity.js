// @flow
import xs from 'xstream';
import isolate from '@cycle/isolate';
import { map, prop, addIndex, always } from 'ramda';
import { pick, mix } from 'cycle-onionify';

import { aEntity } from './utils/AframeHyperscript';
import VertexNodeList from './VertexNodeList';

// TODO make faces dynamic so verts can be added
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

function model(sources) {
  const reducers = {
    initialReducer$: xs.of(always({ nodes: [] })),
  };
  return reducers;
}

function view(prop$, vertexDom$) {
  const meshVert$ = prop$
    .map(verts => xs.combine(...verts))
    .flatten();

  return xs.combine(meshVert$, vertexDom$)
    .map(([verts, vertexDoms]) =>
      aEntity(
        '.edit-mesh',
        {
          attrs: {
            material: 'color: #222222; flatShading: true;',
            geometry: `primitive: editable; faces: ${faces.join(',')}; vertices: ${verts.join(',')};`,
            position: '0 0 0',
          },
        },
        [vertexDoms],
      )
    );
}

function MeshEntity(sources) {
  const { prop$, DOM, rootMouseDown$, onion } = sources;

  const reducers = model(sources);
  const children = isolate(VertexNodeList, 'nodes')(sources);

  const vdom$ = view(prop$, children.DOM);

  const sinks = {
    DOM: vdom$,
    onion: xs.merge(reducers.initialReducer$, children.onion),
  };
  return sinks;
}

export default MeshEntity;
