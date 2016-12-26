import * as most from 'most';
import { aSphere } from './utils/AframeHyperscript';

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

function VertexNode(sources) {
  const state$ = sources.prop$;
  const node = sources.DOM.select('.vertex-node');
  node
  .events('mousedown')
  .combine((_, pos) => pos, state$)
  .forEach(x => console.info(x));

  node
  .events('mouseup')
  .combine((_, pos) => pos, state$)
  .forEach(x => console.info(x));

  node
  .events('mouseout')
  .combine((_, pos) => pos, state$)
  .forEach(x => console.info(x));

  node
  .events('mousemove')
  .combine((_, pos) => pos, state$)
  .forEach(x => console.info(x));

  const vdom$ = view(state$);

  const sinks = {
    DOM: vdom$,
    state: state$,
  };
  return sinks;
}

export default VertexNode;
