import { h } from '@cycle/dom';
import * as most from 'most';

function view(state$) {
  return state$.map(props =>
    h('a-sphere.vertex-node',
      {
        attrs: {
          color: '#00ff00',
          radius: '0.05',
          position: props.position,
        },
      }
    )
  );
}

function VertexNode(sources, initialPosition) {
  const state$ = most.of({ position: initialPosition });
  const vdom$ = view(state$);

  const sinks = {
    vdom$,
    state$,
  };
  return sinks;
}

export default VertexNode;
