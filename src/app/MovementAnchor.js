// @flow
import { T, F, add, zipWith } from 'ramda';
import { aSphere } from './utils/AframeHyperscript';

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
  const { axis, position } = props;
  const config = AXIS_CONFIGS[axis];

  const axisProps = {
    ...config,
    position: zipWith(add, position, config.position),
  };
  return axisProps;
}

function intent(sources) {
  const { DOM, props$, rootMouseUp$, rootMouseMove$ } = sources;
  const mouseDown$ = DOM.select('.movement-anchor').events('mousedown');

  const intents = {
    rootMouseUp$,
    rootMouseMove$,
    mouseDown$,
    props$,
  };
  return intents;
}

function model(actions) {
  const { mouseDown$, rootMouseUp$, rootMouseMove$, props$ } = actions;
  const letGo$ = rootMouseUp$.map(F);
  // const color$ = mouseUp$
  //   .map(T)
  //   .merge(deselect$)
  //   .startWith(false)
  //   .map(isSelected => (isSelected ? '#ff0000' : '#aaaaff'));
  const movement$ = mouseDown$
    .tap(e => e.stopPropogation())
    .map(T)
    .merge(letGo$)
    .combine((isHeld, movement) => [isHeld, movement], rootMouseMove$)
    .filter(([isHeld, _]) => isHeld)
    .map(([_, movement]) => movement);

  const axisProps$ = props$.map(getAxisProps);

  const states = {
    movement$,
    axisProps$,
  };
  return states;
}

function view(state$) {
  return state$.map(props =>
    aSphere(
      '.movement-anchor',
      {
        attrs: {
          material: 'flatShading: true;',
          'segments-height': '10',
          'segments-width': '10',
          radius: '0.05',
          color: props.color,
          rotation: props.rotation,
          position: props.position,
        },
      }
    )
  );
}

function MovementAnchor(sources) {
  const actions = intent(sources);
  const states = model(actions);
  const vdom$ = view(states.axisProps$);

  const sinks = {
    DOM: vdom$,
    state: states.movement$,
  };
  return sinks;
}

export default MovementAnchor;
