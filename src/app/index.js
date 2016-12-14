import * as most from 'most';
import { h } from '@cycle/dom';

// Components
import ModelEntity from './ModelEntity';

function intent(sources) {
  return most.of({});
}

function model(actions) {
  return most.of({});
}

function view(state$) {
  return state$.map(modelEntity =>
    h('section',
      [
        h('a-scene',
          [
            modelEntity,
            h('a-sky', { attrs: { color: '#000022' } }),
          ]
        ),
      ]
    )
  );
}

const Lathe = (sources) => {
  const { DOM } = sources;

  // const action$ = intent(sources);
  // const state$ = model(action$);
  const ModelEntity$ = ModelEntity().vdom$;
  const vdom$ = view(ModelEntity$);

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
