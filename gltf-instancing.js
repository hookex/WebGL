import {BufferGeometry} from "three";

const InstancedMesh = require('three-instanced-mesh')(THREE);

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from '@drecom/stats.js'

let stats = new Stats({maxFPS: 60, maxMem: 100}); // Set upper limit of graph
stats.begin();
document.body.appendChild(stats.dom);

let cluster, _v3;
const Count = 500

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;


    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 1000);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DEFEFF');

    //
    // {
    //     const planeSize = 400;
    //
    //     const loader = new THREE.TextureLoader();
    //     const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.magFilter = THREE.NearestFilter;
    //     const repeats = planeSize / 2;
    //     texture.repeat.set(repeats, repeats);
    //
    //     const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    //     const planeMat = new THREE.MeshPhongMaterial({
    //         map: texture,
    //         side: THREE.DoubleSide,
    //     });
    //     const mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.rotation.x = Math.PI * -.5;
    //     scene.add(mesh);
    // }

    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('https://threejsfundamentals.org/threejs/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
            const root = gltf.scene;
            const car = root.getObjectByName("CAR_03_World_ap_0")

            let glTFGeometry = []
            gltf.scene.traverse(function (child) {
                if (child.castShadow !== undefined) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                console.log('type', child.name)
                if (child.isMesh) {
                    glTFGeometry.push(child.geometry)
                }
            });

            console.log('glTFGeometry', glTFGeometry)

            console.log('gltf', gltf, car)

            let colorMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#369369")});

            cluster = new InstancedMesh(
                glTFGeometry[1],
                colorMaterial,
                Count,                       //instance count
                true,                       //is it dynamic
                false,                      //does it have color
                true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
            );

            _v3 = new THREE.Vector3();
            let _q = new THREE.Quaternion();

            for (let i = 0; i < Count; i++) {
                cluster.setQuaternionAt(i, _q);
                cluster.setPositionAt(i, _v3.set(Math.random() * 1200 - 600, Math.random() * 1200 - 600, -Math.random() * 1000));
                cluster.setScaleAt(i, _v3.set(1, 1, 1));
            }

            scene.add(cluster);
        });
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        stats.update();
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
