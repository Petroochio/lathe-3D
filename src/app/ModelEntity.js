import { h } from '@cycle/dom';
import * as most from 'most';

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

const verts = [
  '1 1 1',
  '1 2 -1',
  '1 -1 1',
  '1 -1 -1',
  '-1 1 -1',
  '-1 1 1',
  '-1 -1 -1',
  '-1 -1 1',
];

function view(state$) {
  return most.of(
    h('a-entity',
      {
        attrs: {
          material: 'color: #ff0000;',
          geometry: `primitive: editable; faces: ${faces.join(',')}; vertices: ${verts.join(',')};`,
          position: '0 0 -5',
        },
      }
    )
  );
}

function ModelEntity(sources) {
  const sinks = {
    vdom$: view(),
  };
  return sinks;
}

export default ModelEntity;
