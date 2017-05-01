import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { __, compose, nth, prop } from 'ramda';
import { aEntity } from './utils/AframeHyperscript';

const AXIS_CONFIGS = {
  x: {
    color: '#ff0000',
    position: '0.3 0 0',
    rotation: '0 0 0',
  },
  y: {
    color: '#0000ff',
    position: '0 0.3 0',
    rotation: '0 0 90',
  },
  z: {
    color: '#00ff00',
    position: '0 0 0.3',
    rotation: '0 90 0',
  },
};

const axisMappers = {
  x: ({ dx }) => [dx / 100, 0, 0],
  y: ({ dy }) => [0, -dy / 100, 0],
  z: ({ dx }) => [0, 0, dx / 100],
};

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
    .compose(sampleCombine(prop$.map(prop('axis')), isHeld$))
    .filter(nth(2))
    .map(([delta, axis]) => axisMappers[axis](delta))
    .startWith([0, 0, 0]);

  const axisProps$ = prop$.map(compose(prop(__, AXIS_CONFIGS), prop('axis')));

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
          geometry: 'primitive: sphere; radius: 0.2; segmentsWidth: 4; segmentsHeight: 2;',
          scale: '1 0.5 0.5',
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
