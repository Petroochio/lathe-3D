import xs from 'xstream';
import isolate from '@cycle/isolate';
import { any, equals, prop, toString } from 'ramda';

import { aEntity } from './utils/AframeHyperscript';
import TranslateAnchor from './TranslateAnchor';

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

function TransformAnchorGroup(sources) {
  const xTranslate = isolate(TranslateAnchor, 'xAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'x' }),
  });

  const yTranslate = isolate(TranslateAnchor, 'yAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'y' }),
  });

  const zTranslate = isolate(TranslateAnchor, 'zAnchor')({
    ...sources,
    prop$: xs.of({ axis: 'z' }),
  });

  const anchors = [xTranslate, yTranslate, zTranslate];

  const childrenVnode$ = xs.combine(...anchors.map(prop('DOM')));
  const update$ = xs.merge(...anchors.map(prop('update$')));
  const holdState$ = xs.combine(...anchors.map(prop('holdState$'))).map(any(equals(true)));

  const vdom$ = view(sources.prop$, childrenVnode$);
  const sinks = {
    update$,
    holdState$,
    DOM: vdom$,
  };
  return sinks;
}
export default TransformAnchorGroup;
