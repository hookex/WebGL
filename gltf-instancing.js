const InstancedMesh = require('three-instanced-mesh')(THREE);

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from '@drecom/stats.js'

let stats = new Stats({maxFPS: 60, maxMem: 100}); // Set upper limit of graph
stats.begin();
document.body.appendChild(stats.dom);

let cluster, _v3;
const Count = 100;

let GIndex = parseInt(window.localStorage.getItem("GIndex") || "0")
window.localStorage.setItem("GIndex", ++GIndex + "")

GIndex = 0

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;


    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 20000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(4000, 2000, 4000);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DEFEFF');

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
            let singleGlTFGeometry = new THREE.BufferGeometry()

            gltf.scene.traverse(function (child) {
                if (child.name.toLocaleLowerCase().indexOf("car") >= 0) {
                    child.visible = false
                }

                if (child.castShadow !== undefined) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                if (child.isMesh) {
                    glTFGeometry.push(child)
                    // singleGlTFGeometry = singleGlTFGeometry.merge(child.geometry, 0)
                }
            });

            scene.add(gltf.scene);

            {
                let clone = root.clone()

                clone.position.x = 0
                clone.position.z = 2100
                scene.add(clone)
            }

            {
                let clone = root.clone()

                clone.position.x = 2100
                clone.position.z = 0
                scene.add(clone)
            }

            {
                let clone = root.clone()

                clone.position.x = 2100
                clone.position.z = 2100
                scene.add(clone)
            }

            console.log('glTFGeometry[GIndex]', glTFGeometry[GIndex])

            cluster = new InstancedMesh(
                glTFGeometry[GIndex].geometry,
                glTFGeometry[GIndex].material,
                Count,
                true,
                false,
                true,
            );

            _v3 = new THREE.Vector3();
            let _q = new THREE.Quaternion();

            for (let i = 0; i < Count; i++) {
                // cluster.setQuaternionAt(i, _q);
                cluster.setPositionAt(i, _v3.set(Math.random() * -2100 * 2, 0, Math.random() * -2100 * 2));
                cluster.setScaleAt(i, _v3.set(2, 2, 2));
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
