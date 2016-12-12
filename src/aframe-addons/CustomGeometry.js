// Based on custom geometry example from AFRAME docs
import AFRAME from 'aframe';
import * as THREE from 'three';

function makeVert(vertex) {
  const points = vertex.split(' ').map(x => parseInt(x, 10));
  return new THREE.Vector3(...points);
}

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
    color: {
      default: '#ffffff',
    },
  },

  init(data) {
    const geometry = new THREE.Geometry();
    const verts = data.vertices.map(makeVert);
    // const triangles = THREE.ShapeUtils.triangulateShape(verts, []); // might be useful
    const faces = [
      new THREE.Face3(0, 2, 1),
      new THREE.Face3(2, 3, 1),
      new THREE.Face3(4, 6, 5),
      new THREE.Face3(6, 7, 5),
      new THREE.Face3(4, 5, 1),
      new THREE.Face3(5, 0, 1),
      new THREE.Face3(7, 6, 2),
      new THREE.Face3(6, 3, 2),
      new THREE.Face3(5, 7, 0),
      new THREE.Face3(7, 2, 0),
      new THREE.Face3(1, 3, 4),
      new THREE.Face3(3, 6, 4),
    ];

    geometry.vertices = verts;
    geometry.faces = faces;
    this.geometry = geometry;
  },
});
