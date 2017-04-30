// Based on custom geometry example from AFRAME docs
import AFRAME from 'aframe';
import * as THREE from 'three';
import { map } from 'ramda';

const parseMap = map(x => parseFloat(x, 10));

/**
 * Make a Vector3 vertext from given string
 * @param vertex : string of 'x y z'
 * @return THREE Face3 from given verts
 */
function makeVert(vertex) {
  const points = parseMap(vertex.split(' '));
  return new THREE.Vector3(...points);
}

/**
 * Make a face3 from given string
 * @param face : string of vertex references
 * @return THREE Face3 from given verts
 */
function makeFace(face) {
  const points = parseMap(face.split(' '));
  return new THREE.Face3(...points);
}

// Default shape is a cube
AFRAME.registerGeometry('editable', {
  schema: {
    vertices: {
      default: [
        '1 1 1',
        '1 1 -1',
        '1 -1 1',
        '1 -1 -1',
        '-1 1 -1',
        '-1 1 1',
        '-1 -1 -1',
        '-1 -1 1',
      ],
    },
    faces: {
      default: [
        '0 2 1',
        '2 3 1',
        '4 6 5',
        '6 7 5',
        '4 5 1',
        '5 0 1',
        '7 6 2',
        '6 3 2',
        '5 7 0',
        '7 2 0',
        '1 3 4',
        '3 6 4',
      ],
    },
    color: {
      default: '#ffffff',
    },
  },

  init(data) {
    const geometry = new THREE.Geometry();
    const verts = data.vertices.map(makeVert);
    // const triangles = THREE.ShapeUtils.triangulateShape(verts, []); // might be useful
    const faces = data.faces.map(makeFace);

    geometry.vertices = verts;
    geometry.faces = faces;
    this.geometry = geometry;
  },
});
