const InstancedMesh = require('three-instanced-mesh')(THREE);
import OrbitControls from 'three-orbitcontrols'
import Stats from '@drecom/stats.js'
import * as THREE from 'three';

let stats = new Stats({maxFPS: 60, maxMem: 100}); // Set upper limit of graph
document.body.appendChild(stats.dom);
stats.begin();

const clock = new THREE.Clock();


let camera, scene, renderer, cluster, _v3, caches = [];
const COUNT = 256 * 256;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(0, 0, 6000);

    scene = new THREE.Scene();


    let texture = new THREE.TextureLoader().load('./static/crate.gif');

    {
        let boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100);
        let textureMaterial = new THREE.MeshBasicMaterial({map: texture});
        let colorMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#369369")});


        //the instance group
        cluster = new InstancedMesh(
            boxGeometry,                 //this is the same
            textureMaterial,
            COUNT,                       //instance count
            false,                       //is it dynamic
            false,                      //does it have color
            true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
        );

        _v3 = new THREE.Vector3();
        let _q = new THREE.Quaternion();

        for (let i = 0; i < COUNT; i++) {
            // cluster.setQuaternionAt(i, _q);
            cluster.setPositionAt(i, _v3.set(Math.random() * 12000 - 6000, Math.random() * 10000 - 5000, -Math.random() * 10000));
            cluster.setScaleAt(i, _v3.set(1, 1, 1));
        }

        scene.add(cluster);
    }

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, -5000);
    controls.update();

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

function rotateObjects(dt) {
    let currentMesh = cache[getKey()];
    let _obj = new THREE.Object3D();
    for (let i = 0; i < currentMesh.numInstances; i++) {
        let o = trsCache[i];
        //modify the cache
        o.rotation.x += o.scale.x * dt;
        o.rotation.y += o.scale.y * dt;
        o.rotation.z += o.scale.z * dt;
        currentMesh.setQuaternionAt(i, o.quaternion.setFromEuler(o.rotation));
    }

    tester.rotation.copy(trsCache[0].rotation);
    currentMesh.needsUpdate('quaternion');
}

function animate() {

    requestAnimationFrame(animate);

    const delta = 100;

    // rotateObjects(delta);
    //
    for (let i = 0; i < COUNT; i++) {
        // cluster.setQuaternionAt(i, _q);
        let {x, y, z} = cluster.getPositionAt(i)
        cluster.setPositionAt(i, _v3.set(x + Math.random() * delta - delta/2, y + Math.random() * delta - delta/2, z + Math.random() * delta - delta/2));
        // cluster.setScaleAt(i, _v3.set(1, 1, 1));
        // cluster.setPositionAt(i, _v3.set(Math.random() * 12000 - 6000, Math.random() * 10000 - 5000, -Math.random() * 10000));
        cluster.needsUpdate('position')
    }

    renderer.render(scene, camera);

    stats.update();
}
