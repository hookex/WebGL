const InstancedMesh = require('three-instanced-mesh')(THREE);
import OrbitControls from 'three-orbitcontrols'
import Stats from '@drecom/stats.js'
import * as THREE from 'three';
import * as dat from 'dat.gui';

const FizzyText = function () {
    this.instanceCount = 10;
    this.widthSegments = 13;
    this.heightSegments = 14;

    // this.widthSegments = 3;
    // this.heightSegments = 3;

    // this.side = THREE.DoubleSide;
    this.ambientLight = true;
    this.hemisphereLight = false;
    this.directionalLight = false;
    this.pointLight = false;
    this.spotLight = true;

    this.shadow = true;
    this.depthTest = true;

    this.transparent = true;
    this.antialias = true;
    this.pixelRatio = 2;

    this.precision = 'highp';
    this.powerPreference = 'default';
    this.frustumCulled = false;
};

let timer = null;

let gui = new dat.GUI({
    width: 400,
});
let effectGui = new dat.GUI({
    width: 300
});

let textController = new FizzyText();
let f1 = gui.addFolder('参数');
f1.open();
let f3 = gui.addFolder('结果');
f3.open();

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
    const countController = f1.add(textController, 'instanceCount', 1, 10000)
        .name('实例数量')
        .step(1);
    countController.onFinishChange(begin);

    const widthSegmentsController = f1.add(textController, 'widthSegments', 3, 100)
        .name('球宽片段数')
        .step(1);
    widthSegmentsController.onFinishChange(begin);

    const heightSegmentsController = f1.add(textController, 'heightSegments', 2, 100)
        .name('球高片段数')
        .step(1);
    heightSegmentsController.onFinishChange(begin);


    f1.add(textController, 'ambientLight').name('环境光')
        .onFinishChange(begin);

    f1.add(textController, 'hemisphereLight').name('半球光')
        .onFinishChange(begin);

    f1.add(textController, 'directionalLight').name('平行光')
        .onFinishChange(begin);

    f1.add(textController, 'pointLight').name('点光源')
        .onFinishChange(begin);

    f1.add(textController, 'spotLight').name('聚光灯')
        .onFinishChange(begin);

    f1.add(textController, 'antialias').name('抗锯齿')
        .onFinishChange(begin);

    f1.add(textController, 'shadow').name('阴影')
        .onFinishChange(begin);

    f1.add(textController, 'depthTest').name('深度检测')
        .onFinishChange(begin);

    f1.add(textController, 'transparent').name('透明度')
        .onFinishChange(begin);

    f1.add(textController, 'pixelRatio', [1, 2]).name('像素比')

    f1.add(textController, 'precision', ['highp', 'mediump', 'lowp']).name('精度')
        .onFinishChange(begin);

    // f1.add(textController, 'side', [THREE.FrontSide, THREE.DoubleSide, THREE.BackSide])
    //     .onFinishChange(begin);

    f1.add(textController, 'powerPreference', ['default', 'high-performance', 'low-power'])
        .onFinishChange(begin);

    f1.add(textController, 'frustumCulled')
        .name('视野剪裁')
        .onFinishChange(begin);

    f3.add(textController, 'triangleCount').name('三角形数量');
    f3.add(textController, 'perSphereVertexCount').name('实例顶点数');
    f3.add(textController, 'frame').name('帧数');
    f3.add(textController, 'calls').name('API调用次数');
    f3.add(textController, 'points');
    f3.add(textController, 'lines');
};

let stats = new Stats({maxFPS: 60, maxMem: 10000}); // Set upper limit of graph
document.body.appendChild(stats.dom);
stats.begin();

const colors = [0x4F86EC, 0xD9503F, 0xF2BD42, 0x58A55C]

let camera, scene, renderer, cluster;
let angle = 0;
let scaleFactor = 1;

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
    clear();
    init(textController.instanceCount);
    animate();
}

begin();

function init(count) {
    effectGui.destroy();
    effectGui = new dat.GUI({
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
    if (textController.ambientLight) {
        // see color = materialColor * light.color * light.intensity;
        const light = new THREE.AmbientLight(0xffffff);
        scene.add(light);

        effectGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('环境光：颜色');
        effectGui.add(light, 'intensity', 0, 2, 0.01).name('环境光：强度');
    }

    /**
     * 半球光
     * In that way it's best used in combination with some other light
     * or a substitute for an AmbientLight.
     */
    if (textController.hemisphereLight) {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.5;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);

        effectGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('半球光：天空色');
        effectGui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('半球光：地色');
        effectGui.add(light, 'intensity', 0, 2, 0.01).name('半球光：光强');
    }


    /**
     * 平行光
     * is often used to represent the sun.
     */
    if (textController.directionalLight) {
        const color = 0x1b82c3;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.distance = 50000;

        light.castShadow = true;

        // light.shadow.mapSize.width = 51200;  // default
        // light.shadow.mapSize.height = 51200; // default
        light.shadow.camera.near = 1;    // default
        light.shadow.camera.far = 40000;     // default
        light.position.set(10000, 20000, 10000);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);

        effectGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('平行光：颜色');
        effectGui.add(light, 'intensity', 0, 2, 0.01).name('平行光：光强');
        effectGui.add(light.position, 'x', 0, 10000).name('平行光：光源x');
        effectGui.add(light.position, 'z', 0, 10000).name('平行光：光源y');
        effectGui.add(light.position, 'y', 0, 20000).name('平行光：光源z');

        // scene.add(new THREE.CameraHelper(camera))
        light.shadowCameraVisible = true;

    }

    /**
     * 点光源
     */
    if (textController.pointLight) {
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

    if (textController.spotLight) {
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

        effectGui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('聚光灯：颜色');
        effectGui.add(light, 'intensity', 0, 2, 0.01).name('聚光灯：光强');
        effectGui.add(light, 'angle', 0, Math.PI/2, 0.01).name('角度');
        effectGui.add(light.position, 'x', 0, 10000).name('聚光灯：光源x');
        effectGui.add(light.position, 'y', 0, 10000).name('聚光灯：光源y');
        effectGui.add(light.position, 'z', 0, 10000).name('聚光灯：光源z');
        effectGui.add(light.target.position, 'x', 0, 10000).name('聚光灯目标：光源x');
        effectGui.add(light.target.position, 'z', 0, 10000).name('聚光灯目标：光源y');
        effectGui.add(light.target.position, 'y', 0, 10000).name('聚光灯目标：光源z');
    }

    // let texture = new THREE.TextureLoader().load('./static/crate.gif');

    {
        let geometry = new THREE.SphereBufferGeometry(100, textController.widthSegments, textController.heightSegments);
        // let textureMaterial = new THREE.MeshBasicMaterial({map: texture});

        let mat = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: colors[2],
            specular: 0x222222,
            flatShading: THREE.SmoothShading,
            transparent: textController.transparent,
        });

        if (textController.transparent) {
            mat.opacity = 0.7;
        }

        textController.perSphereVertexCount = geometry.index.count;
        for (let i in f3.__controllers) {
            f3.__controllers[i].updateDisplay();
        }

        cluster = new InstancedMesh(
            geometry,                 //this is the same
            mat,
            count,                       //instance count
            true,                       //is it dynamic
            true,                      //does it have color
            true,                        //uniform scale, if you know that the placement function will not do a non-uniform scale, this will optimize the shader
        );

        let _v3 = new THREE.Vector3();
        let _q = new THREE.Quaternion();

        for (let i = 0; i < count; i++) {
            cluster.setQuaternionAt(i, _q);
            cluster.setPositionAt(i,
                _v3.set(
                    Math.random() * 10000,
                    Math.random() * 10000,
                    Math.random() * 10000
                )
            );

            let scale = Math.random() + 0.5;
            cluster.setScaleAt(i, _v3.set(scale, scale, scale));
        }

        cluster.visible = true;
        cluster.castShadow = textController.shadow;
        cluster.receiveShadow = textController.shadow;

        cluster.frustumCulled = textController.frustumCulled;

        {
            const cubeSize = 50;
            const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, 5000, cubeSize);
            const cubeMat = new THREE.MeshPhongMaterial({
                color: '#CCC',
                side: THREE.DoubleSide,
            });
            cubeMat.depthTest = textController.depthTest;
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
                transparent: textController.transparent,
            });

            if (textController.transparent) {
                material.opacity = 0.7;
            }

            material.depthTest = textController.depthTest;

            let plane = new THREE.Mesh(geometry, material);
            plane.position.x = 5000;
            plane.position.y = 0;
            plane.position.z = 5000;
            plane.rotateX(Math.PI / 2);

            plane.receiveShadow = textController.shadow;
            plane.castShadow = textController.shadow;

            scene.add(plane);
        }

        scene.add(cluster);
    }

    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: textController.antialias, // 抗锯齿, 太耗性能
        precision: textController.precision,
        powerPreference: textController.powerPreference,
    });

    renderer.shadowMap.enabled = textController.shadow;
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

    console.log('renderer.shadowMap', renderer.shadowMap)

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(5000, 5000, 5000);
    controls.update();

    // window.devicePixelRatio
    renderer.setPixelRatio(textController.pixelRatio);
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

    for (let i = 0; i < cluster.numInstances; i++) {
        let {x, y, z} = cluster.getPositionAt(i)
        let _v3 = new THREE.Vector3();

        cluster.setPositionAt(i,
            _v3.set(
                x,
                y + Math.random() * delta - delta / 2,
                z)
        );

        cluster.setColorAt(i, new THREE.Color(colors[parseInt(Math.random() * colors.length)]));

        let quaternion = cluster.getQuaternionAt(i);
        angle += 0.1;
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        cluster.setQuaternionAt(i, quaternion);

        let scale = cluster.getScaleAt(i).x;

        if (scale < 0.2) {
            scaleFactor = 1;
        } else if (scale > 2) {
            scaleFactor = -1;
        }

        scale = scale + scaleFactor * 0.03;

        cluster.setScaleAt(i, _v3.set(scale, scale, scale));
        cluster.needsUpdate()
        // cluster.needsUpdate('quaternion');
        // cluster.needsUpdate('position')
        // cluster.needsUpdate('color')
    }
}

function animate() {
    run();

    const canvas = renderer.domElement;

    // 画布长宽
    let {clientWidth} = canvas;
    let {clientHeight} = canvas;

    // 像素数量
    const {width, height} = canvas;

    // 像素比
    const {pixelRatio} = textController;
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

    textController.triangleCount = renderer.info.render.triangles;
    textController.frame = renderer.info.render.frame;
    textController.points = renderer.info.render.points;
    textController.lines = renderer.info.render.lines;
    textController.calls = renderer.info.render.calls;

    for (let i in f3.__controllers) {
        f3.__controllers[i].updateDisplay();
    }

    stats.update();

    timer = requestAnimationFrame(animate);
}

function clear() {
    if (timer) {
        cancelAnimationFrame(timer);
    }
}
