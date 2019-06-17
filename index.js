// import "./instancing-with-three-1.1"
// import "./instancing-with-three-1.2"
// import "./instancing-with-three-1.3"

import createWorker from 'offscreen-canvas/create-worker'

const workerUrl = document.querySelector('[rel=preload][as=script]').href
const canvas = document.querySelector('canvas')

const worker = createWorker(canvas, workerUrl)

// import "./instanced-mesh"
// import "./solar"
// import "./gltf"
// import "./buffer-geometry"
// import "./gltf-instancing"

