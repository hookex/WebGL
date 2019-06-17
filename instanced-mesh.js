const InstancedMesh = require('three-instanced-mesh')(THREE);
import OrbitControls from 'three-orbitcontrols'
import Stats from '@drecom/stats.js'
import * as THREE from 'three';

let stats = new Stats({maxFPS: 60, maxMem: 100}); // Set upper limit of graph
document.body.appendChild(stats.dom);
stats.begin();

const colors = [0x4F86EC, 0xD9503F, 0xF2BD42, 0x58A55C]

let camera, scene, renderer, cluster, _v3;
let dirLight, spotLight;
const COUNT = 256 * 256;

let bluePhongMaterial = new THREE.MeshPhongMaterial( {
    color: colors[0],
    shininess: 150,
    specular: 0x222222,
    flatShading: THREE.SmoothShading
});

let redPhongMaterial = new THREE.MeshPhongMaterial( {
    color: colors[1],
    shininess: 150,
    specular: 0x222222,
    flatShading: THREE.SmoothShading
});

let yellowPhongMaterial = new THREE.MeshPhongMaterial( {
    color: colors[2],
    shininess: 150,
    specular: 0x222222,
    flatShading: THREE.SmoothShading
});

function getPhongMaterial() {
    const index = ~~(Math.random() * 3)
    console.log('index', index)
    return [bluePhongMaterial, redPhongMaterial, yellowPhongMaterial][index]
}

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1 || 15000, 100000);
    camera.position.set(0, 0, 6000);

    scene = new THREE.Scene();

    // Lights
    scene.add( new THREE.AmbientLight( 0x404040 ) );

    spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.name = 'Spot Light';
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.3;
    spotLight.position.set( 12000, 12000, 12000 );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 80;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add( spotLight );

    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.name = 'Dir. Light';
    dirLight.position.set( 12000, 12000, 12000 );
    // dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 10;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.left = - 15;
    dirLight.shadow.camera.top	= 15;
    dirLight.shadow.camera.bottom = - 15;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add( dirLight );

    let texture = new THREE.TextureLoader().load('./static/crate.gif');

    {
        let boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100);
        let textureMaterial = new THREE.MeshBasicMaterial({map: texture});
        let colorMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#369369")});

        let phongMaterial = new THREE.MeshPhongMaterial( {
            color: colors[2],
            shininess: 150,
            specular: 0x222222,
            flatShading: THREE.SmoothShading
        });

        cluster = new InstancedMesh(
        boxGeometry,                 //this is the same
        phongMaterial,
        COUNT,                       //instance count
        true,                       //is it dynamic
        true,                      //does it have color
        true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
    );

        _v3 = new THREE.Vector3();
        let _q = new THREE.Quaternion();

        for (let i = 0; i < COUNT; i++) {
            cluster.setQuaternionAt(i, _q);
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

function run() {
    const delta = 10;

    for (let i = 0; i < COUNT; i++) {
        // cluster.setQuaternionAt(i, _q);
        let {x, y, z} = cluster.getPositionAt(i)
        cluster.setPositionAt(i, _v3.set(x + Math.random() * delta - delta / 2, y + Math.random() * delta - delta / 2, z + Math.random() * delta - delta / 2));
        cluster.setColorAt(i, new THREE.Color(colors[i % colors.length]));
        // cluster.setScaleAt(i, _v3.set(1, 1, 1));
        // cluster.setPositionAt(i, _v3.set(Math.random() * 12000 - 6000, Math.random() * 10000 - 5000, -Math.random() * 10000));
        cluster.needsUpdate('position')
        cluster.needsUpdate('color')
    }
}

function animate() {

    requestAnimationFrame(animate);

    run()

    renderer.render(scene, camera);

    stats.update();
}
