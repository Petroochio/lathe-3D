// TODO: Add mouse enter
// Component for aframe cameras that emits mouse events on aframe tags, and do it cycle style
import AFRAME from 'aframe';
import { Raycaster, Vector2 } from 'three';
import xs from 'xstream';
import { compose, curry, equals, flatten, find, isNil, not, path, pipe } from 'ramda';

const sharedRaycaster = new Raycaster();
const mouseVector = new Vector2();

function isObjectGroup(object) {
  return object.type === 'Group';
}

function isVisibleIntersect(item) {
  return item.object.parent.visible === true;
}

function getEntityChildren(entity) {
  return entity
    .children // This is ugly
    .map(child => (isObjectGroup(child) ? getEntityChildren(child) : child));
}

function setRaycastFromCamera(raycaster, camera, vector) {
  // This could be better
  raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);

  raycaster.ray.direction
    .set(vector.x, vector.y, 0.5)
    .unproject(camera)
    .sub(raycaster.ray.origin)
    .normalize();

  return raycaster;
}

function intersectFunc(element, vector) {
  const sceneObj3D = element.sceneEl.object3D;
  const camera = element.getObject3D('camera');
  const allChildren = flatten(getEntityChildren(sceneObj3D))
    .filter(compose(not, equals('disable-mouse'), path(['el', 'className'])));

  const intersects = setRaycastFromCamera(sharedRaycaster, camera, vector)
    .intersectObjects(allChildren);

  if (intersects.length > 0) {
    return find(isVisibleIntersect, intersects).object.parent.el;
  }
  return null;
}
const getIntersect = curry(intersectFunc);

function eventFunc(eventName, base, target) {
  const evt = new MouseEvent(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
    trusted: true,
  });
  target.dispatchEvent(evt);
}
const emitEvent = curry(eventFunc);

// Mouse Position based on window ratio
function getWorldPosition(evt) {
  const { innerWidth, innerHeight } = window;
  const { clientX, clientY } = evt;

  const position = {
    x: ((clientX / innerWidth) * 2) - 1,
    y: (-1 * (clientY / innerHeight) * 2) + 1,
  };
  return position;
}

function setMouseVector(evt) {
  const { x, y } = getWorldPosition(evt);
  mouseVector.set(x, y);
  return mouseVector;
}

function DomEventProducer(eventName, element) {
  const producer = {
    start: listener => element.addEventListener(eventName, e => listener.next(e)),
    stop: () => false,
  };
  return producer;
}

function DomEventListener(eventName, element) {
  const listener = {
    next: emitEvent(eventName, element),
    error: e => console.error(e),
    complete: () => console.log('complete'),
  };
  return listener;
}

function intent(sources) {
  const { el } = sources;
  const mouseDown$ = xs.create(DomEventProducer('mousedown', el.sceneEl.canvas));
  const mouseMove$ = xs.create(DomEventProducer('mousemove', el.sceneEl.canvas));
  const mouseUp$ = xs.create(DomEventProducer('mouseup', el.sceneEl.canvas));
  const mouseOut$ = xs.create(DomEventProducer('mouseout', el.sceneEl.canvas));

  const intents = {
    mouseDown$,
    mouseMove$,
    mouseUp$,
    mouseOut$,
  };
  return intents;
}

function pushDomEvents(type, element) {
  return event$ => event$
    .map(setMouseVector)
    .map(getIntersect(element))
    .filter(pipe(isNil, not))
    .subscribe(DomEventListener(type, element));
}

function model(actions, element) {
  const { mouseDown$, mouseMove$, mouseUp$, mouseOut$ } = actions;

  mouseDown$.compose(pushDomEvents('mousedown', element));
  // TODO Needs to be altered to get delta?
  mouseMove$.compose(pushDomEvents('mousemove', element));
  mouseUp$.compose(pushDomEvents('mouseup', element));
  mouseOut$.compose(pushDomEvents('mouseout', element));
}

AFRAME.registerComponent('mouse-events',
  {
    schema: {},
    init() {
      // Do nothing until the scene is ready for us
      this.el.sceneEl.addEventListener(
        'render-target-loaded',
        () => {
          const actions = intent(this);
          model(actions, this.el);
        }
      );
    },
  }
);
