// @flow
import { T, F } from 'ramda';
import { aEntity } from './utils/AframeHyperscript';

function intent(sources) {
  const { DOM, prop$, rootMouseDown$ } = sources;
  const mouseUp$ = DOM.select('.vertex-node').events('mouseup');

  const intents = {
    rootMouseDown$,
    mouseUp$,
    prop$,
  };
  return intents;
}

function model(actions) {
  const { mouseUp$, rootMouseDown$, prop$ } = actions;
  const deselect$ = rootMouseDown$.map(F);
  const selected$ = mouseUp$
    .map(T)
    .merge(deselect$)
    .startWith(false)
    .map(isSelected => (isSelected ? '#ff0000' : '#aaaaff'));

  const state$ = selected$.combine((color, p) => ({ ...p, color }), prop$);
  return state$;
}

function view(state$) {
  return state$.map(props =>
    aEntity(
      '.vertex-node',
      {
        attrs: {
          geometry: 'primitive: sphere; radius: 0.05; segmentsWidth: 10; segmentsHeight: 10;',
          material: `flatShading: true; color: ${props.color}`,
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
  };
  return sinks;
}

export default VertexNode;
