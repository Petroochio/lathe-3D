import xs from 'xstream';
import isolate from '@cycle/isolate';
import { add, any, equals, zipWith } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';
import MovementAnchor from './MovementAnchor';

function view(position$, children$) {
  return xs.combine(position$, children$)
    .map(([position, anchors]) =>
      aEntity(
        '.movement-anchor-group',
        {
          attrs: {
            position: position.join(' '),
          },
        },
        anchors,
      )
    );
}

function MovementAnchorGroup(sources) {
  const xAnchor = isolate(MovementAnchor, 'xAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'x' }),
  });

  const yAnchor = isolate(MovementAnchor, 'yAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'y' }),
  });

  const zAnchor = isolate(MovementAnchor, 'zAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'z' }),
  });

  const childrenVnode$ = xs.combine(xAnchor.DOM, yAnchor.DOM, zAnchor.DOM);
  const update$ = xs.merge(xAnchor.update$, yAnchor.update$, zAnchor.update$);
  const holdState$ = xs.combine(
      xAnchor.holdState$,
      yAnchor.holdState$,
      zAnchor.holdState$
    )
    .map(any(equals(true)));

  const position$ = xs.merge(sources.prop$, update$)
    .fold(zipWith(add), [0, 0, 0])
    .startWith([0, 0, 0]);
  const vdom$ = view(position$, childrenVnode$);
  const sinks = {
    update$,
    holdState$,
    DOM: vdom$,
  };
  return sinks;
}
export default MovementAnchorGroup;
