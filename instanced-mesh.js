const InstancedMesh = require('three-instanced-mesh')(THREE);
import OrbitControls from 'three-orbitcontrols'
import Stats from '@drecom/stats.js'
import * as THREE from 'three';
import * as dat from 'dat.gui';

const search = location.search.split('?')[1] || '0';
let antialias = false;

if (search === '1') {
    antialias = true;
}

const ControlText = function () {
    // 结果
    this.instanceCount = 30000;
    // 调参
    this.shadow = false;
    this.transparent = false;
    this.antialias = antialias;
    this.pixelRatio = 1;

    // this.shadow = true;
    // this.transparent = true;
    // this.antialias = true;
    // this.pixelRatio = 2;


    this.animate = true;

    this.widthSegments = 10;
    this.heightSegments = 2;


    this.ambientLight = true;
    this.hemisphereLight = false;
    this.directionalLight = false;
    this.pointLight = false;
    this.spotLight = true;

    this.depthTest = false;


    this.precision = 'highp';
    this.powerPreference = 'default';
    this.frustumCulled = false;
};

let controlGui = new dat.GUI({
    width: 400,
});

let lightGui = new dat.GUI({
    width: 300
});

let text = new ControlText();
let f1 = controlGui.addFolder('参数');
f1.open();
let f2 = controlGui.addFolder('结果');
f2.open();

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

window.onload = function () {
    const countController = f1.add(text, 'instanceCount', 1, 10000000)
        .name('实例数量')
        .step(1);
    countController.onFinishChange(begin);

    const widthSegmentsController = f1.add(text, 'widthSegments', 3, 100)
        .name('球宽片段数')
        .step(1);
    widthSegmentsController.onFinishChange(begin);

    const heightSegmentsController = f1.add(text, 'heightSegments', 2, 100)
        .name('球高片段数')
        .step(1);
    heightSegmentsController.onFinishChange(begin);

    f1.add(text, 'animate').name('运动');


    f1.add(text, 'ambientLight').name('环境光')
        .onFinishChange(begin);

    f1.add(text, 'hemisphereLight').name('半球光')
        .onFinishChange(begin);

    f1.add(text, 'directionalLight').name('平行光')
        .onFinishChange(begin);

    f1.add(text, 'pointLight').name('点光源')
        .onFinishChange(begin);

    f1.add(text, 'spotLight').name('聚光灯')
        .onFinishChange(begin);

    f1.add(text, 'antialias').name('抗锯齿')
        .onFinishChange(begin);

    f1.add(text, 'shadow').name('阴影')
        .onFinishChange(begin);

    f1.add(text, 'depthTest').name('深度检测')
        .onFinishChange(begin);

    f1.add(text, 'transparent').name('透明')
        .onFinishChange(begin);

    f1.add(text, 'pixelRatio', [1, 2]).name('像素比')

    f1.add(text, 'precision', ['highp', 'mediump', 'lowp']).name('精度')
        .onFinishChange(begin);

    f1.add(text, 'powerPreference', ['default', 'high-performance', 'low-power'])
        .onFinishChange(begin);

    f1.add(text, 'frustumCulled')
        .name('视野剪裁')
        .onFinishChange(begin);

    f2.add(text, 'triangleCount').name('三角形数量');
    f2.add(text, 'perSphereVertexCount').name('实例顶点数');
    f2.add(text, 'frame').name('帧数');
    f2.add(text, 'calls').name('API调用次数');
    f2.add(text, 'points');
    f2.add(text, 'lines');
    f2.add(text, 'geometries');
    f2.add(text, 'textures');
};

let stats = new Stats({maxFPS: 60, maxMem: 10000}); // Set upper limit of graph
document.body.appendChild(stats.dom);
stats.begin();

const colors = [0x4F86EC, 0xD9503F, 0xF2BD42, 0x58A55C]

let timer = null;
let camera, scene, renderer, cluster;
let angle = 0;
let scaleFactor = 1;

function begin() {
    clear();
    init(text.instanceCount);
    run();
    animate();
}

begin();

function init(count) {
    lightGui = new dat.GUI({
        width: 300
    });

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
    camera.lookAt(5000, 5000, 5000)
    camera.position.set(5000, 5000, 25000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    /**
     * 环境光
     * making the darks not too dark.
     */
    if (text.ambientLight) {
        // see color = materialColor * light.color * light.intensity;
        const light = new THREE.AmbientLight(0xffffff);
        scene.add(light);

        lightGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('环境光：颜色');
        lightGui.add(light, 'intensity', 0, 2, 0.01).name('环境光：强度');
    }

    /**
     * 半球光
     * In that way it's best used in combination with some other light
     * or a substitute for an AmbientLight.
     */
    if (text.hemisphereLight) {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.5;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);

        lightGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('半球光：天空色');
        lightGui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('半球光：地色');
        lightGui.add(light, 'intensity', 0, 2, 0.01).name('半球光：光强');
    }


    /**
     * 平行光
     * is often used to represent the sun.
     */
    if (text.directionalLight) {
        const color = 0x1b82c3;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.distance = 30000;

        light.castShadow = true;

        // light.shadow.mapSize.width = 51200;  // default
        // light.shadow.mapSize.height = 51200; // default
        light.shadow.camera.near = 1;    // default
        light.shadow.camera.far = 20000;     // default
        light.position.set(10000, 20000, 10000);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);

        lightGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('平行光：颜色');
        lightGui.add(light, 'intensity', 0, 2, 0.01).name('平行光：光强');
        lightGui.add(light.position, 'x', 0, 10000).name('平行光：光源x');
        lightGui.add(light.position, 'z', 0, 10000).name('平行光：光源y');
        lightGui.add(light.position, 'y', 0, 20000).name('平行光：光源z');

        // scene.add(new THREE.CameraHelper(camera))
        light.shadowCameraVisible = true;

    }

    /**
     * 点光源
     */
    if (text.pointLight) {
        const color = 0xFFFFFF;
        const intensity = 10;
        const light = new THREE.PointLight(color, intensity);
        light.distance = 10000;
        light.castShadow = true;
        light.position.set(5000, 5000, 5000);
        light.angle = Math.PI / 5;
        light.penumbra = 0.3;

        light.shadow.mapSize.width = 5000;  // default
        light.shadow.mapSize.height = 5000; // default
        light.shadow.camera.near = 1;       // default
        light.shadow.camera.far = 5000;      // default

        scene.add(light);
    }

    if (text.spotLight) {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.SpotLight(color, intensity);

        light.castShadow = true;

        // light.shadow.mapSize.width = 51200;  // default
        // light.shadow.mapSize.height = 51200; // default
        light.shadow.camera.near = 1;    // default
        light.shadow.camera.far = 40000;     // default

        light.position.set(10000, 12000, 10000);
        light.angle = Math.PI / 4;

        scene.add(light);
        scene.add(light.target);

        lightGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('聚光灯：颜色');
        lightGui.add(light, 'intensity', 0, 2, 0.01).name('聚光灯：光强');
        lightGui.add(light, 'angle', 0, Math.PI / 2, 0.01).name('角度');
        lightGui.add(light.position, 'x', 0, 10000).name('聚光灯：光源x');
        lightGui.add(light.position, 'y', 0, 10000).name('聚光灯：光源y');
        lightGui.add(light.position, 'z', 0, 10000).name('聚光灯：光源z');
        lightGui.add(light.target.position, 'x', 0, 10000).name('聚光灯目标：光源x');
        lightGui.add(light.target.position, 'z', 0, 10000).name('聚光灯目标：光源y');
        lightGui.add(light.target.position, 'y', 0, 10000).name('聚光灯目标：光源z');
    }

    // let texture = new THREE.TextureLoader().load('./static/crate.gif');

    {
        let geometry = new THREE.SphereBufferGeometry(100, text.widthSegments, text.heightSegments);
        // let textureMaterial = new THREE.MeshBasicMaterial({map: texture});

        let mat = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: colors[2],
            specular: 0x222222,
            flatShading: THREE.SmoothShading,
            transparent: text.transparent,
        });

        if (text.transparent) {
            mat.opacity = 0.7;
        }

        text.perSphereVertexCount = geometry.index.count;

        updateGui();

        cluster = new InstancedMesh(
            geometry,                 //this is the same
            mat,
            count,                       //instance count
            true,                       //is it dynamic
            true,                      //does it have color
            true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
        );

        let v3 = new THREE.Vector3();
        let q = new THREE.Quaternion();

        for (let i = 0; i < count; i++) {
            cluster.setQuaternionAt(i, q);
            cluster.setPositionAt(i,
                v3.set(
                    Math.random() * 10000,
                    Math.random() * 10000,
                    Math.random() * 10000
                )
            );

            let scale = Math.random() + 0.5;
            cluster.setScaleAt(i, v3.set(scale, scale, scale));
        }

        cluster.visible = true;
        cluster.castShadow = text.shadow;
        cluster.receiveShadow = text.shadow;
        cluster.frustumCulled = text.frustumCulled;
        cluster.renderOrder = 10000;

        {
            const cubeSize = 50;
            const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, 5000, cubeSize);
            const cubeMat = new THREE.MeshPhongMaterial({
                color: '#CCC',
                side: THREE.DoubleSide,
            });
            cubeMat.depthTest = text.depthTest;
            const mesh = new THREE.Mesh(cubeGeo, cubeMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(5000, 500, 5000);
            scene.add(mesh);
        }

        {
            const planeSize = 10000;

            let geometry = new THREE.PlaneBufferGeometry(planeSize * 2, planeSize * 2, 0);
            let material = new THREE.MeshLambertMaterial({
                color: 0x369369,
                side: THREE.DoubleSide,
                transparent: text.transparent,
            });

            if (text.transparent) {
                material.opacity = 0.7;
            }

            material.depthTest = text.depthTest;

            let plane = new THREE.Mesh(geometry, material);
            plane.position.x = 5000;
            plane.position.y = 0;
            plane.position.z = 5000;
            plane.rotateX(Math.PI / 2);

            plane.receiveShadow = text.shadow;
            plane.castShadow = text.shadow;

            scene.add(plane);
        }

        scene.add(cluster);
    }

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: text.antialias, // 抗锯齿, 太耗性能
        precision: text.precision,
        powerPreference: text.powerPreference,
    });

    renderer.shadowMap.enabled = text.shadow;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // renderer.shadowMapSoft = true;
    // renderer.shadowCameraNear = 3;
    // renderer.shadowCameraFar = 40000;
    // renderer.shadowCameraFov = 50;
    //
    // renderer.shadowMapBias = 0.0039;
    // renderer.shadowMapDarkness = 0.5;
    // renderer.shadowMapWidth = 10000;
    // renderer.shadowMapHeight = 10000;


    const controls = new OrbitControls(camera, canvas);
    controls.target.set(5000, 5000, 5000);
    controls.update();

    // window.devicePixelRatio
    renderer.setPixelRatio(text.pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, true);

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
    const delta = 40;
    let v3 = new THREE.Vector3();

    for (let i = 0; i < cluster.numInstances; i++) {
        {
            let {x, y, z} = cluster.getPositionAt(i)
            cluster.setPositionAt(i,
                v3.set(
                    x,
                    y + Math.random() * delta - delta / 2,
                    z)
            );
        }

        cluster.setColorAt(i, new THREE.Color(colors[parseInt(Math.random() * colors.length)]));

        {
            let quaternion = cluster.getQuaternionAt(i);
            angle += 0.1;
            quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            cluster.setQuaternionAt(i, quaternion);
        }

        {
            let scale = cluster.getScaleAt(i).x;

            if (scale < 0.2) {
                scaleFactor = 1;
            } else if (scale > 2) {
                scaleFactor = -1;
            }

            scale = scale + scaleFactor * 0.03;

            cluster.setScaleAt(i, v3.set(scale, scale, scale));
        }

        cluster.needsUpdate()
        // cluster.needsUpdate('quaternion');
        // cluster.needsUpdate('position')
        // cluster.needsUpdate('color')
    }
}

function animate() {
    if (text.animate) {
        run();
    }

    const canvas = renderer.domElement;

    // 画布长宽
    let {clientWidth} = canvas;
    let {clientHeight} = canvas;

    // 像素数量
    const {width, height} = canvas;

    // 像素比
    const {pixelRatio} = text;
    renderer.setPixelRatio(pixelRatio)

    const needResize = width !== clientWidth * pixelRatio || height !== clientHeight * pixelRatio;

    if (needResize) {
        renderer.setSize(clientWidth, clientHeight, true);
    }

    {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    updateResultText();

    updateGui();

    stats.update();
    timer = requestAnimationFrame(animate);
}

function clear() {
    lightGui && lightGui.destroy();
    renderer && renderer.clear();

    if (timer) {
        cancelAnimationFrame(timer);
    }
}

function updateGui() {
    for (let i in f1.__controllers) {
        f1.__controllers[i].updateDisplay();
    }

    for (let i in f2.__controllers) {
        f2.__controllers[i].updateDisplay();
    }
}

function updateResultText() {
    text.triangleCount = renderer.info.render.triangles;
    text.frame = renderer.info.render.frame;
    text.points = renderer.info.render.points;
    text.lines = renderer.info.render.lines;
    text.calls = renderer.info.render.calls;
    text.geometries = renderer.info.memory.geometries;
    text.textures = renderer.info.memory.textures;
}
