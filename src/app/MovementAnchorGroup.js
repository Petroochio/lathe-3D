import xs from 'xstream';
import isolate from '@cycle/isolate';
import { any, equals, toString } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';
import MovementAnchor from './MovementAnchor';

function view(position$, children$) {
  return xs.combine(position$, children$)
    .map(([{ isVisible, position }, anchors]) =>
      aEntity(
        '.movement-anchor-group',
        {
          attrs: {
            visible: toString(isVisible),
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

  const vdom$ = view(sources.prop$, childrenVnode$);
  const sinks = {
    update$,
    holdState$,
    DOM: vdom$,
  };
  return sinks;
}
export default MovementAnchorGroup;
