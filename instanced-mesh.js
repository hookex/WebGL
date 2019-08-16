const InstancedMesh = require('three-instanced-mesh')(THREE);
import OrbitControls from 'three-orbitcontrols'
import Stats from '@drecom/stats.js'
import * as THREE from 'three';
import * as dat from 'dat.gui';

const FizzyText = function () {
    this.instanceCount = 600;
    this.widthSegments = 13;
    this.heightSegments = 14;

    // this.side = THREE.DoubleSide;
    this.light = true;
    // this.shadow = true;

    this.transparent = true;
    this.antialias = true;
    this.precision = 'highp';
    this.powerPreference = 'default';
    this.frustumCulled = false;
};

let timer = null;

let gui = new dat.GUI({
    width: 400,
});

let textController = new FizzyText();
let f1 = gui.addFolder('参数');
f1.open();
let f2 = gui.addFolder('结果');
f2.open();

window.onload = function () {
    const countController = f1.add(textController, 'instanceCount', 100, 10000).step(100);
    countController.onFinishChange(begin);

    const widthSegmentsController = f1.add(textController, 'widthSegments', 3, 100).step(1);
    widthSegmentsController.onFinishChange(begin);

    const heightSegmentsController = f1.add(textController, 'heightSegments', 2, 100).step(1);
    heightSegmentsController.onFinishChange(begin);

    f1.add(textController, 'perSphereVertexCount');

    f1.add(textController, 'light')
        .onFinishChange(begin);

    f1.add(textController, 'antialias')
        .onFinishChange(begin);

    // f1.add(textController, 'shadow')
    //     .onFinishChange(begin);
    //
    f1.add(textController, 'transparent')
        .onFinishChange(begin);

    f1.add(textController, 'precision', ['highp', 'mediump', 'lowp'])
        .onFinishChange(begin);

    // f1.add(textController, 'side', [THREE.FrontSide, THREE.DoubleSide, THREE.BackSide])
    //     .onFinishChange(begin);

    f1.add(textController, 'powerPreference', ['default', 'high-performance', 'low-power'])
        .onFinishChange(begin);

    f1.add(textController, 'frustumCulled')
        .onFinishChange(begin);

    f2.add(textController, 'triangleCount');
    f2.add(textController, 'frame');
    f2.add(textController, 'calls');
    f2.add(textController, 'points');
    f2.add(textController, 'lines');
};

let stats = new Stats({maxFPS: 60, maxMem: 10000}); // Set upper limit of graph
document.body.appendChild(stats.dom);
stats.begin();

const colors = [0x4F86EC, 0xD9503F, 0xF2BD42, 0x58A55C]

let camera, scene, renderer, cluster, _v3;
let dirLight, spotLight;


let bluePhongMaterial = new THREE.MeshPhongMaterial({
    color: colors[0],
    shininess: 150,
    specular: 0x222222,
    flatShading: THREE.SmoothShading
});

let redPhongMaterial = new THREE.MeshPhongMaterial({
    color: colors[1],
    shininess: 150,
    specular: 0x222222,
    flatShading: THREE.SmoothShading
});

let yellowPhongMaterial = new THREE.MeshPhongMaterial({
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

function begin() {
    clear()
    init(textController.instanceCount);
    animate();
}

begin();

function init(count) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1 || 15000, 100000);
    camera.position.set(0, 0, 6000);

    scene = new THREE.Scene();

    // Lights
    scene.add(new THREE.AmbientLight(0x404040));

    if (textController.light) {
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.name = 'Spot Light';
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.3;
        spotLight.position.set(12000, 12000, 12000);
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 1;
        spotLight.shadow.camera.far = 9999;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        scene.add(spotLight);

        dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(12000, 12000, 12000);
        // dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.left = -15;
        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.bottom = -15;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);
    }

    let texture = new THREE.TextureLoader().load('./static/crate.gif');

    {
        let boxGeometry = new THREE.SphereBufferGeometry(100, textController.widthSegments, textController.heightSegments);
        let textureMaterial = new THREE.MeshBasicMaterial({map: texture});
        let colorMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color("#369369")});

        let phongMaterial = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            color: colors[2],
            shininess: 150,
            specular: 0x222222,
            flatShading: THREE.SmoothShading,
            transparent: textController.transparent,
        });

        if (textController.transparent) {
            phongMaterial.opacity = 0.6;
        }

        textController.perSphereVertexCount = boxGeometry.index.count;
        for (let i in f1.__controllers) {
            f1.__controllers[i].updateDisplay();
        }

        cluster = new InstancedMesh(
            boxGeometry,                 //this is the same
            phongMaterial,
            count,                       //instance count
            true,                       //is it dynamic
            true,                      //does it have color
            true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
        );

        _v3 = new THREE.Vector3();
        let _q = new THREE.Quaternion();

        for (let i = 0; i < count; i++) {
            cluster.setQuaternionAt(i, _q);
            cluster.setPositionAt(i, _v3.set(Math.random() * 12000 - 6000, Math.random() * 10000 - 5000, -Math.random() * 10000));
            cluster.setScaleAt(i, _v3.set(1, 1, 1));
        }

        cluster.visible = true;

        if (textController.shadow) {
            cluster.castShadow = true;
            cluster.receiveShadow = true;
        }


        cluster.frustumCulled = textController.frustumCulled;

        let geometry = new THREE.PlaneGeometry(12000, 12000, 1);
        let material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.z = -6000;
        plane.position.y = -6000;
        plane.rotateX(Math.PI / 2);
        plane.receiveShadow = textController.shadow;
        scene.add(plane);

        scene.add(cluster);
    }

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: textController.antialias, // 抗锯齿, 太耗性能
        precision: textController.precision,
        powerPreference: textController.powerPreference,
    });

    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, -5000);
    controls.update();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    console.log(renderer.info)
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function run() {
    const delta = 30;

    for (let i = 0; i < cluster.numInstances; i++) {
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
    timer = requestAnimationFrame(animate);
    run()
    renderer.render(scene, camera);

    textController.triangleCount = renderer.info.render.triangles;
    textController.frame = renderer.info.render.frame;
    textController.points = renderer.info.render.points;
    textController.lines = renderer.info.render.lines;
    textController.calls = renderer.info.render.calls;

    for (let i in f2.__controllers) {
        f2.__controllers[i].updateDisplay();
    }

    stats.update();
}

function clear() {
    if (timer) {
        cancelAnimationFrame(timer);
    }
}
