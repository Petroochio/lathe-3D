import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { __, add, compose, nth, prop, zipWith } from 'ramda';
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

// TODO: This is nasty and imperative, plx fix
const axisMappers = {
  x: ({ dx }, { xdeg }) => [(dx / 100) * ((xdeg >= 90 && xdeg <= 270) || (xdeg <= -90 && xdeg >= -270) ? -1 : 1), 0, 0],
  y: ({ dy }, { ydeg }) => [0, (dy / 100) * ((ydeg >= -90 && ydeg < 90) ? -1 : 1), 0],
  z: ({ dx }, { xdeg }) => [0, 0, (dx / 100) * ((xdeg > -180 && xdeg <= 0) || xdeg > 180 ? 1 : -1)],
};

function intent(sources) {
  const { DOM } = sources;
  const mouseDown$ = DOM.select('.movement-anchor').events('mousedown');

  const intents = {
    mouseDown$,
  };
  return intents;
}

function model(sources, actions) {
  const { cameraRotation$, rootMouseUp$, rootMouseMove$, prop$ } = sources;
  const { mouseDown$ } = actions;
  const isHeld$ = xs.merge(mouseDown$.mapTo(true), rootMouseUp$.mapTo(false));

  const axisProps$ = prop$.map(compose(prop(__, AXIS_CONFIGS), prop('axis')));

  const translate$ = rootMouseMove$
    .compose(sampleCombine(prop$.map(prop('axis')), cameraRotation$, isHeld$))
    .filter(nth(3))
    .map(([delta, axis, rotation]) => axisMappers[axis](delta, rotation))
    .startWith([0, 0, 0])
    .map(zipWith(add));

  const scale$ = xs.empty();
  const transform$ = xs.merge(translate$, scale$);

  const states = {
    transform$,
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
          geometry: 'primitive: cube; radius: 0.2;',
          color: props.color,
          rotation: props.rotation,
          position: props.position,
        },
      }
    )
  );
}

/**
 * @selectedVerts$ - all currently selected verts
 * @props
 *    axis - 'x', 'y', or 'z'
 *    position - [x, y, z] coords
 */
function ScaleAnchor(sources) {
  const actions = intent(sources);
  const state = model(sources, actions);
  const vdom$ = view(state);

  const sinks = {
    DOM: vdom$,
    update$: state.transform$,
    holdState$: state.isHeld$,
  };
  return sinks;
}

export default ScaleAnchor;
