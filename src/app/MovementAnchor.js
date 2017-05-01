import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { add, apply, join, nth, prop, zipWith } from 'ramda';
import { aEntity } from './utils/AframeHyperscript';

const AXIS_CONFIGS = {
  x: {
    color: '#ff0000',
    position: [1, 0, 0],
    rotation: '0 0 0',
  },
  y: {
    color: '#ff0000',
    position: [0, 1, 0],
    rotation: '0 0 0',
  },
  z: {
    color: '#ff0000',
    position: [0, 0, 1],
    rotation: '0 0 0',
  },
};

function getAxisProps(props) {
  const [position, { axis }] = props;
  const config = AXIS_CONFIGS[axis];
  const axisProps = {
    ...config,
    position: join(' ')(zipWith(add, position, config.position)),
  };
  return axisProps;
}

function intent(sources) {
  const { DOM, prop$, rootMouseUp$, rootMouseMove$ } = sources;
  const mouseDown$ = DOM.select('.movement-anchor').events('mousedown');

  const intents = {
    rootMouseUp$,
    rootMouseMove$,
    mouseDown$,
    prop$,
  };
  return intents;
}

function model(actions) {
  const { mouseDown$, rootMouseUp$, rootMouseMove$, prop$ } = actions;
  const isHeld$ = xs.merge(mouseDown$.mapTo(true), rootMouseUp$.mapTo(false));

  const movement$ = rootMouseMove$
    .compose(sampleCombine(isHeld$))
    .filter(nth(1))
    .map(nth(0))
    .mapTo([0.01, 0, 0])
    .startWith([0, 0, 0]);

  const position$ = xs.merge(prop$.map(prop('position')), movement$)
    .fold(zipWith(add), [0, 0, 0]);

  const axisProps$ = position$
    .compose(sampleCombine(prop$))
    .map(getAxisProps);

  const states = {
    movement$,
    axisProps$,
    isHeld$,
  };
  return states;
}

function view(state) {
  return state.axisProps$.map(props =>
    aEntity(
      '.movement-anchor',
      {
        attrs: {
          material: `flatShading: true; color: ${props.color}`,
          geometry: 'primitive: sphere; radius: 1; segmentsWidth: 10; segmentsHeight: 10;',
          color: props.color,
          rotation: props.rotation,
          position: props.position,
        },
      }
    )
  );
}

/**
 * @props
 *    axis - 'x', 'y', or 'z'
 *    position - [x, y, z] coords
 */
function MovementAnchor(sources) {
  const actions = intent(sources);
  const state = model(actions);
  const vdom$ = view(state);

  const sinks = {
    DOM: vdom$,
    update$: state.movement$,
    holdState$: state.isHeld$,
  };
  return sinks;
}

export default MovementAnchor;
