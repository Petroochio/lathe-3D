import { T, F } from 'ramda';
import { aSphere } from './utils/AframeHyperscript';

function intent(sources) {
  const { DOM, props, rootMouseDown$ } = sources;
  const mouseUp$ = DOM.select('.vertex-node').events('mouseup');

  const intents = {
    rootMouseDown$,
    mouseUp$,
    props,
  };
  return intents;
}

function model(actions) {
  const { mouseUp$, rootMouseDown$, props } = actions;
  const deselect$ = rootMouseDown$.map(F);
  const color$ = mouseUp$
    .map(T)
    .merge(deselect$)
    .startWith(false)
    .map(isSelected => (isSelected ? '#ff0000' : '#aaaaff'));


  const state$ = color$.combine((color, p) => ({ ...p, color }), props);

  return state$;
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
          color: props.color,
          radius: '0.05',
          position: props.position,
        },
      }
    )
  );
}

function VertexNode(sources) {
  const actions = intent(sources);
  const state$ = model(actions);
  const vdom$ = view(state$);

  const sinks = {
    DOM: vdom$,
    state: state$,
  };
  return sinks;
}

export default VertexNode;
