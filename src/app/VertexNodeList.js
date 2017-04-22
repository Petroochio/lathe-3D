import xs from 'xstream';
import isolate from '@cycle/isolate';
import { pick, mix } from 'cycle-onionify';
import { map, addIndex } from 'ramda';

import VertexNode from './VertexNode';

function createVertNode(sources) {
  return (position$, index) => {
    const vertSources = {
      ...sources,
      prop$: position$,
    };
    return isolate(VertexNode, index)(vertSources);
  };
}

function model(sources) {
  const initialReducer$ = xs.of(() => []);

  const reducers = {
    initialReducer$,
  };
  return reducers;
}

function viewModel(state$, vertexDoms$) {
  return vertexDoms$;
}

function view(viewState$) {
  return viewState$;
}

function VertexNodeList(sources) {
  const { prop$, DOM, onion, rootMouseDown$ } = sources;

  const vertexNode$ = prop$.map(
    addIndex(map)((createVertNode(sources)))
  );

  const vertexDoms$ = vertexNode$
    .compose(pick('DOM'))
    .compose(mix(xs.combine));

  const vertexReducer$ = vertexNode$
    .compose(pick('onion'))
    .compose(mix(xs.merge));

  const reducers = model();
  const viewState = viewModel(onion.state$, vertexDoms$);
  const vdom$ = view(viewState);

  const sinks = {
    DOM: vdom$,
    onion: xs.merge(reducers.initialReducer$, vertexReducer$),
  };
  return sinks;
}

export default VertexNodeList;
