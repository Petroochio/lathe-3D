// @flow
import xs from 'xstream';
import { add, join, zipWith } from 'ramda';
import { aEntity } from './utils/AframeHyperscript';

function intent(sources) {
  const { DOM, rootMouseDown$ } = sources;
  const mouseUp$ = DOM.select('.vertex-node').events('mouseup');

  const intents = {
    rootMouseDown$,
    mouseUp$,
  };
  return intents;
}

function model(actions, initialPos) {
  const { mouseUp$, rootMouseDown$ } = actions;
  const position$ = mouseUp$
    .mapTo([0.01, 0, 0])
    .fold(zipWith(add), initialPos)
    .startWith(initialPos)
    .map(join(' '));

  const selected$ = xs.merge(
      mouseUp$.mapTo(true),
      rootMouseDown$.mapTo(false)
    )
    .startWith(false);
  const color$ = selected$.map(isSelected => (isSelected ? '#ff0000' : '#aaaaff'));

  return {
    position$,
    selected$,
    color$,
  };
}

function view(state) {
  return xs.combine(state.position$, state.color$)
    .map(([position, color]) =>
      aEntity(
        '.vertex-node',
        {
          attrs: {
            geometry: 'primitive: sphere; radius: 0.05; segmentsWidth: 10; segmentsHeight: 10;',
            material: `flatShading: true; color: ${color}`,
            position,
          },
        }
      )
    );
}

function VertexNode(sources) {
  const actions = intent(sources);
  const state = model(actions, sources.initialPos);

  const state$ = xs.combine(state.selected$, state.position$)
    .map(([isSelected, position]) => ({ isSelected, position }));

  const vdom$ = view(state);

  const sinks = {
    state$,
    DOM: vdom$,
  };
  return sinks;
}

export default VertexNode;
