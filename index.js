import {
    Scene,
    PerspectiveCamera,
    Geometry,
    Vector3,
    Line,
    LineBasicMaterial,
    Mesh,
    WebGLRenderer
} from './static/three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

loader.load('./static/corsa_finale/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

const renderer = new WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();
