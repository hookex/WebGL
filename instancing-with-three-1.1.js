import * as THREE from 'three';

let camera, scene, renderer;
let mesh, myGroup;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    const myGeom = new THREE.BoxGeometry()
    const myMaterial = new THREE.MeshBasicMaterial()

    myGroup = new THREE.Group()
    for (let i = 0; i < 100; i++) {
        const myMesh = new THREE.Mesh(myGeom, myMaterial)
        myGroup.add(myMesh)
        myMesh.frustumCulled = false
        myMesh.position.set(Math.random(), Math.random(), Math.random())
    }

    scene.add(myGroup)

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    myGroup.rotation.x += 0.005;
    myGroup.rotation.y += 0.01;
    renderer.render(scene, camera);
}
