import {Scene, PerspectiveCamera, Geometry, Vector3, Line, LineBasicMaterial, Mesh, WebGLRenderer} from './static/three';

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set( 0, 0, 50 );
camera.lookAt( 0, 0, 0 );

const material = new LineBasicMaterial( { color: 0x0000ff } );;

const geometry = new Geometry();
geometry.vertices.push(new Vector3( -10, 0, 0) );
geometry.vertices.push(new Vector3( 0, 10, 0) );
geometry.vertices.push(new Vector3( 10, 0, 0) );

const line = new Line( geometry, material );
scene.add(line);

const renderer = new WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();
