import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import * as dat from "lil-gui";
import * as TWEEN from "@tweenjs/tween.js";

const EPSILON = 0.1;

// Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const count = 3;

// Add GUI
const gui = new dat.GUI();

const animate = (rubikCube) => () => {
	const key = getRandomMove();

	const firstCube = selectRandomCube(rubikCube);

	makeAMove(firstCube, key, rubikCube, 1);

	setTimeout(
		() =>
			makeAMove(selectRandomCube(rubikCube, firstCube), invertKey(key), rubikCube, Math.floor(Math.random() * 3 + 1)),
		250
	);
};

const createRubikCube = (count = 3) => {
	// Variables
	// declare a purple color
	const color = "#19121C";
	const cubeColor = new THREE.Color(color);

	// Cube
	const geometry = new RoundedBoxGeometry(0.85, 0.85, 0.85, 2, 0.1);
	const material = new THREE.MeshStandardMaterial({
		color: cubeColor,
		metalness: 1,
		roughness: 0.2,
	});

	const cube = new THREE.Mesh(geometry, material);

	// create a rubik cube
	const rubikCube = new THREE.Group();
	rubikCube.rotation.y = Math.PI / 4;

	const gap = 0.9;

	for (let i = 0; i < count; i++) {
		for (let j = 0; j < count; j++) {
			for (let k = 0; k < count; k++) {
				const cubeClone = cube.clone();
				cubeClone.position.x = (i - count / 2 + 0.5) * gap;
				cubeClone.position.y = (j - count / 2 + 0.5) * gap;
				cubeClone.position.z = (k - count / 2 + 0.5) * gap;

				rubikCube.add(cubeClone);
			}
		}
	}

	return { rubikCube, color };
};

const createScene = (rubikCube) => {
	// Scene
	const scene = new THREE.Scene();

	// Canvas
	const canvas = document.querySelector("canvas.webgl");

	scene.add(rubikCube);

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

		return scene;
	});

	//Camera
	const aspect = window.innerWidth / window.innerHeight;
	const d = count + 0.5;

	const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
	scene.add(camera);

	camera.position.set(d, d, d);
	camera.lookAt(scene.position);

	// Lights
	const rightSpot = new THREE.PointLight(0xb545dd);
	rightSpot.intensity = 5;
	rightSpot.angle = 0.5;
	rightSpot.position.set(0, -1, -5);
	scene.add(rightSpot);

	const leftSpot = new THREE.SpotLight(0x185976);
	leftSpot.intensity = 1.5;
	leftSpot.distance = 10;
	leftSpot.angle = 0.5;
	leftSpot.position.set(0, 0, 5);
	scene.add(leftSpot);

	const topPoint = new THREE.SpotLight(0xffffff);
	topPoint.intensity = 2;
	topPoint.distance = 7;
	topPoint.position.set(0, 5, 0);
	scene.add(topPoint);

	const ambientLight = new THREE.AmbientLight(0xb545dd, 1);
	scene.add(ambientLight);

	// Controls
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		alpha: true,
	});
	renderer.setClearColor(0x000000, 0); // the default
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);

	gui.addColor({ cubeColor: color }, "cubeColor").onChange((color) => {
		rubikCube.children.forEach((cube) => {
			cube.material.color.set(color);
		});
	});

	// add light color to gui
	gui.addColor({ rightSpotColor: rightSpot.color.getHex() }, "rightSpotColor").onChange((color) => {
		rightSpot.color.set(color);
	});

	gui.addColor({ leftSpotColor: leftSpot.color.getHex() }, "leftSpotColor").onChange((color) => {
		leftSpot.color.set(color);
	});

	gui.addColor({ topPointColor: topPoint.color.getHex() }, "topPointColor").onChange((color) => {
		topPoint.color.set(color);
	});

	gui.add({ metalness: 0.7 }, "metalness", 0, 1, 0.01).onChange((metalness) => {
		rubikCube.children.forEach((cube) => {
			cube.material.metalness = metalness;
		});
	});

	gui.add({ roughness: 0.7 }, "roughness", 0, 1, 0.01).onChange((roughness) => {
		rubikCube.children.forEach((cube) => {
			cube.material.roughness = roughness;
		});
	});

	// gui.add({ count }, "count", 0, 10, 1).onChange((count) => {
	// 	scene.remove(rubikCube);
	// 	const { rubikCube: newRubikCube } = createRubikCube(count);
	// 	scene.add(newRubikCube);
	// 	window.clearInterval(id);
	// 	id = window.setInterval(animate(rubikCube), 1000);
	// });

	return { scene, camera, controls, renderer };
};

const { rubikCube, color } = createRubikCube();
let id = window.setInterval(animate(rubikCube), 1000);
const { scene, camera, controls, renderer } = createScene(rubikCube);

// Animate
const tick = (t) => {
	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// rotate rubikCube
	rubikCube.rotation.y = t / 1500;
	rubikCube.rotation.x = t / 1500;

	TWEEN.update(t);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

const cubeInSameY = (c1, c2) => c1.position.y > c2.position.y - EPSILON && c1.position.y < c2.position.y + EPSILON;

const cubeInSameX = (c1, c2) => c1.position.x > c2.position.x - EPSILON && c1.position.x < c2.position.x + EPSILON;

const cubeInSameZ = (c1, c2) => c1.position.z > c2.position.z - EPSILON && c1.position.z < c2.position.z + EPSILON;

const rotateAroundWorldAxis = (cube, axis, rubikCube, times = 1) => {
	const start = { rotation: 0 };
	const prev = { rotation: 0 };
	const end = { rotation: (Math.PI / 2) * times };

	const tween = new TWEEN.Tween(start)
		.to(end, 750)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(({ rotation }) => {
			cube.position.applyAxisAngle(axis, rotation - prev.rotation);
			cube.rotateOnWorldAxis(axis, rotation - prev.rotation);

			prev.rotation = rotation;
		});

	tween.start();
};

const getRandomMove = () => ["w", "a", "s", "d"][Math.floor(Math.random() * 4)];

const makeAMove = (selectedCube, key, rubikCube, times = 1) => {
	if (key === "w") {
		const axis = new THREE.Vector3(-1, 0, 0);
		rubikCube.children.forEach((cube) => {
			if (cubeInSameX(cube, selectedCube)) rotateAroundWorldAxis(cube, axis, rubikCube, times);
		});
	} else if (key === "a") {
		const axis = new THREE.Vector3(0, -1, 0);
		rubikCube.children.forEach((cube) => {
			if (cubeInSameY(cube, selectedCube)) rotateAroundWorldAxis(cube, axis, rubikCube, times);
		});
	} else if (key === "s") {
		const axis = new THREE.Vector3(1, 0, 0);
		rubikCube.children.forEach((cube) => {
			if (cubeInSameX(cube, selectedCube)) rotateAroundWorldAxis(cube, axis, rubikCube, times);
		});
	} else if (key === "d") {
		const axis = new THREE.Vector3(0, 1, 0);
		rubikCube.children.forEach((cube) => {
			if (cubeInSameY(cube, selectedCube)) rotateAroundWorldAxis(cube, axis, rubikCube, times);
		});
	}
};

const invertKey = (key) => (key === "w" ? "s" : key === "a" ? "d" : key === "s" ? "w" : key === "d");

const selectRandomCube = (rubikCube, excludeCube) => {
	const randomIndex = Math.floor(Math.random() * rubikCube.children.length);

	if (excludeCube) {
		const selectedCube = rubikCube.children[randomIndex];

		if (selectedCube === excludeCube) {
			return selectRandomCube(rubikCube, excludeCube);
		}

		if (
			cubeInSameX(selectedCube, excludeCube) ||
			cubeInSameY(selectedCube, excludeCube) ||
			cubeInSameZ(selectedCube, excludeCube)
		)
			return selectRandomCube(rubikCube, excludeCube);
	}

	return rubikCube.children[randomIndex];
};

tick();
