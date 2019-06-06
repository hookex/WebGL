import {Scene, PerspectiveCamera, BoxGeometry, ShaderMaterial, Mesh, WebGLRenderer} from './static/three';

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const geometry = new BoxGeometry(1, 1, 1);
const material = new ShaderMaterial({
    vertexShader: document.getElementById('vs').textContent.trim(),
    fragmentShader: document.getElementById('fs').textContent.trim()
});
const cube = new Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl2');
const renderer = new WebGLRenderer({canvas: canvas, context: context});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
