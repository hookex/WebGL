import insideWorker from 'offscreen-canvas/inside-worker'
import * as THREE from 'three';

let camera, scene, renderer;
let mesh;

function init(canvas) {
    camera = new THREE.PerspectiveCamera(70, 3/4, 1, 1000);
    camera.position.z = 400;
    scene = new THREE.Scene();
    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    let material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x003399)});
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({canvas});
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}

const worker = insideWorker(e => {
    if (e.data.canvas) {
        let camera, scene, renderer;
        let mesh;
        init(e.data.canvas);
        animate();
    }
})
