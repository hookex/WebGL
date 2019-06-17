// webgl.worker.js
// import insideWorker from 'offscreen-canvas/inside-worker'
// console.log('window', window)
// const worker = insideWorker(e => {
//     if (e.data.canvas) {
//         // Draw on the canvas
//     } else if (e.data.message === 'move') {
//         // Messages from main thread
//     }
// })


// Post data to parent thread
self.postMessage({ foo: 'foo' })

// Respond to message from parent thread
self.addEventListener('message', (event) => console.log(event))
