import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene
const scene = new THREE.Scene();

// Canvas
const canvas = document.querySelector("canvas.webgl");

const yellow = new THREE.Color("rgb(255, 255, 0)");
const blue = new THREE.Color("rgb(0, 0, 255)");
const red = new THREE.Color("rgb(255, 0, 0)");
const green = new THREE.Color("rgb(0, 255, 0)");
const orange = new THREE.Color("rgb(255, 165, 0)");
const white = new THREE.Color("rgb(255, 255, 255)");
const colorsArray = [yellow, blue, red];
// Cube
const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
const len = geometry.getAttribute("position").count;
console.log(len);
const colors = [];
let i = 0;
while (i < len) {
	const a1 = i / len;
	const a2 = 1 - Math.abs(0.5 - a1) / 0.5;
	colors.push(0, a2, 1 - a2);
	i += 1;
}
console.log(colors);
const color_attribute = new THREE.BufferAttribute(new Float32Array(colors), 3);
geometry.setAttribute("color", color_attribute);
const material = new THREE.MeshBasicMaterial({ vertexColors: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// create a rubik cube
const rubikCube = new THREE.Group();
const gap = 1.1;
for (let i = 0; i < 3; i++) {
	for (let j = 0; j < 3; j++) {
		for (let k = 0; k < 3; k++) {
			const cubeClone = cube.clone();
			cubeClone.position.x = (i - 1) * gap;
			cubeClone.position.y = (j - 1) * gap;
			cubeClone.position.z = (k - 1) * gap;
			rubikCube.add(cubeClone);
		}
	}
}
scene.add(rubikCube);

// Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

// Animate
const tick = () => {
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
