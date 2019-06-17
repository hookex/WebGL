// import "./instancing-with-three-1.1"
// import "./instancing-with-three-1.2"
// import "./instancing-with-three-1.3"


import Worker from './webgl.worker.js';

const worker = new Worker();

worker.postMessage({ a: 1 });
worker.onmessage = function (event) {};

worker.addEventListener("message", function (event) {});

// import createWorker from 'offscreen-canvas/create-worker'
// const canvas = document.querySelector('canvas')
//
// const worker = createWorker(canvas, '/webgl.worker.js', e => {
//     // Messages from the worker
// })

// import "./instanced-mesh"
// import "./solar"
// import "./gltf"
// import "./buffer-geometry"
// import "./gltf-instancing"

