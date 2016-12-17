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

function view(state$) {
  return state$.map(props =>
    h('a-entity',
      {
        attrs: {
          material: 'color: #ff0000;',
          geometry: `primitive: editable; faces: ${faces.join(',')}; vertices: ${props.verts.join(',')};`,
          position: '0 0 -5',
        },
      }
    )
  );
}

function ModelEntity(sources) {
  const sinks = {
    vdom$: view(sources.prop$),
  };
  return sinks;
}

export default ModelEntity;
