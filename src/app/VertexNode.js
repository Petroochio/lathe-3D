import * as most from 'most';
import { aSphere } from './utils/AframeHyperscript';

function model(position) {
  return most.of({ position });
}

function view(state$) {
  return state$.map(props =>
    aSphere(
      '.vertex-node',
      {
        attrs: {
          material: 'flatShading: true;',
          'segments-height': '10',
          'segments-width': '10',
          color: '#aaaaff',
          radius: '0.05',
          position: props.position,
        },
      }
    )
  );
}

function VertexNode(sources, position) {
  const state$ = model(position);
  const vdom$ = view(state$);

  const sinks = {
    vdom$,
    state$,
  };
  return sinks;
}

export default VertexNode;
