const InstancedMesh = require('three-instanced-mesh')(THREE);

import * as THREE from 'three';

// import InstancedMesh from 'three-instanced-mesh'
// require( 'three-instanced-mesh' )(THREE);


let camera, scene, renderer;
init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // camera.position.set( 0, 150, 350 );

    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 15, 35 );

    scene = new THREE.Scene();

    let texture = new THREE.TextureLoader().load('./static/crate.gif');
    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    let material = new THREE.MeshBasicMaterial({map: texture});
    // let mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh);
    //
    // const myMeshes = new InstancedMesh(geometry, material, 1)
    // scene.add(myMeshes);


    {
        //geometry to be instanced
        let boxGeometry = new THREE.BoxBufferGeometry(2, 2, 2, 1, 1, 1);

        //material that the geometry will use
        let material = new THREE.MeshBasicMaterial({color: new THREE.Color("white")});

        //the instance group
        let cluster = new InstancedMesh(
            boxGeometry,                 //this is the same
            material,
            10000,                       //instance count
            false,                       //is it dynamic
            false,                      //does it have color
            true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
        );

        let _v3 = new THREE.Vector3();
        let _q = new THREE.Quaternion();

        for (let i = 0; i < 10000; i++) {
            cluster.setQuaternionAt(i, _q);
            cluster.setPositionAt(i, _v3.set(Math.random(), Math.random(), Math.random()));
            cluster.setScaleAt(i, _v3.set(1, 1, 1));
        }

        scene.add(cluster);
    }

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
    renderer.render(scene, camera);
}
