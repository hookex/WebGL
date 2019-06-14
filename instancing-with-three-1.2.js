import * as THREE from 'three';

let camera, scene, renderer;
let myCluster;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    const geom = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial()
    const mergedGeometry = new THREE.BufferGeometry()
    for ( let i = 0 ; i < 10 ; i ++ ) {
        const nodeGeometry = geom.clone()
        nodeGeometry.translate(Math.random(),Math.random(),Math.random())
        mergedGeometry.merge(new THREE.BufferGeometry().fromGeometry(nodeGeometry), i)
    }
    myCluster = new THREE.Mesh( mergedGeometry, material)
    scene.add(myCluster)

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
    // myCluster.rotation.x += 0.005;
    // myCluster.rotation.y += 0.01;
    renderer.render(scene, camera);
}
