// Component for aframe cameras that emits mouse events on aframe tags, and do it cycle style
import AFRAME from 'aframe';
import { Raycaster, Vector2 } from 'three';
import { fromEvent } from 'most';

const raycaster = new Raycaster();
const mouseVector = new Vector2();

function intent(source) {
  const { el } = source;

  const mouseDown$ = fromEvent('mousedown', el.sceneEl.canvas);
  const mouseMove$ = fromEvent('mousemove', el.sceneEl.canvas);
  const mouseUp$ = fromEvent('mouseup', el.sceneEl.canvas);
  const mouseOut$ = fromEvent('mouseout', el.sceneEl.canvas);

  mouseDown$.forEach(e => console.info('down'));
  mouseMove$.forEach(e => console.info('move'));
  mouseUp$.forEach(e => console.info('up'));
  mouseOut$.forEach(e => console.info('out'));
}

AFRAME.registerComponent('mouse-events',
  {
    schema: {},
    init() {
      this.el.sceneEl.addEventListener(
        'render-target-loaded',
        () => {
          const actions = intent(this);
        }
      );
    },
  }
);
