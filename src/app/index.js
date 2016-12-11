import * as most from 'most';
import { h } from '@cycle/dom';

// Components

function intent(sources) {
  return most.of({});
}

function model(actions) {
  return most.of({});
}

function view(state$) {
  console.log('?');
  return most.of(
    h('section',
      [
        h('a-scene',
          [
            h('a-box', { attrs: { position: '1 1 -5', color: '#ff0000' } }),
            h('a-sky', { attrs: { color: '#000022' } }),
          ]
        ),
      ]
    )
  );
}

const Lathe = (sources) => {
  const { DOM } = sources;

  const action$ = intent(sources);
  const state$ = model(action$);
  const vdom$ = view(state$);
  vdom$.forEach(x => console.info(x));

  const sinks = {
    DOM: vdom$,
  };
  return sinks;
};

export default Lathe;
