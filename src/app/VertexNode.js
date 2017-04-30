import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { add, any, compose, equals, join, not, nth, tail, zipWith } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';

function intent(sources) {
  const { DOM } = sources;
  const mouseUp$ = DOM.select('.vertex-node').events('mouseup');

  const intents = {
    mouseUp$,
  };
  return intents;
}

function model(sources, actions) {
  const { mouseUp$ } = actions;
  const { initialPos, rootInput$, altKeyState$, shiftKeyState$ } = sources;
  const position$ = mouseUp$
    .mapTo([0.01, 0, 0])
    .fold(zipWith(add), initialPos)
    .startWith(initialPos)
    .map(join(' '));

  const selectTrigger$ = mouseUp$.compose(sampleCombine(altKeyState$))
    .filter(compose(not, nth(1)))
    .mapTo(true);

  const deselectTrigger$ = rootInput$.compose(sampleCombine(altKeyState$, shiftKeyState$))
    .filter(compose(not, any(equals(true)), tail))
    .mapTo(false);

  const selected$ = xs.merge(selectTrigger$, deselectTrigger$).startWith(false);
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
  const state = model(sources, actions);

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
