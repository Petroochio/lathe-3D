// @flow
import xs from 'xstream';
import { always } from 'ramda';
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

function model(actions) {
  const { mouseUp$, rootMouseDown$ } = actions;
  const selected$ = xs.merge(
      mouseUp$.mapTo({ isSelected: true }),
      rootMouseDown$.mapTo({ isSelected: false })
    )
    .startWith({ isSelected: false });

  const color$ = selected$.map(({ isSelected }) => (isSelected ? '#ff0000' : '#aaaaff'));
  // const selectedReducer$ = selected$.map(always); // .map((x) => y => { console.log(y); return x; });

  return {
    selectedReducer$: mouseUp$.mapTo(always({ isSelected: true })).startWith(always({ isSelected: false })),
    color$,
  };
}

function viewModel(prop$, state$) {

}

function view(prop$, state) {
  return xs.combine(prop$, state.color$)
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
  const state = model(actions);
  const vdom$ = view(sources.prop$, state);
  const initialReducer$ = xs.of(always({ isSelected: false }));
  const reducer$ = xs.merge(initialReducer$, state.selectedReducer$);

  const sinks = {
    DOM: vdom$,
    onion: reducer$,
  };
  return sinks;
}

export default VertexNode;
