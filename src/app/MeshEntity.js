// @flow
import xs from 'xstream';
import isolate from '@cycle/isolate';
import { map, prop, addIndex, always } from 'ramda';
import Collection from '@cycle/collection';

import { aEntity } from './utils/AframeHyperscript';
import VertexNode from './VertexNode';

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
        vertexDoms,
      )
    );
}

function MeshEntity(sources) {
  const { prop$, DOM, rootMouseDown$ } = sources;

  const vertNodes$ = Collection(VertexNode, sources, prop$.map(map(vert$ => ({ prop$: vert$ }))));
  const vertDoms$ = Collection.pluck(vertNodes$, prop('DOM'));

  const vdom$ = view(prop$, vertDoms$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
}

export default MeshEntity;
