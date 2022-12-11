import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const speedMulFac = 3;
const velocityForward = .02 * speedMulFac;
const velocityBackward = .01 * speedMulFac;
const velocityLeft = .005 * speedMulFac;
const velocityRight = .005 * speedMulFac;

let canMoveForward = false;
let canMoveLeft = false;
let canMoveRight = false;
let canMoveBackward = false;


let scene, camera, renderer, controls;

// Create scene
scene = new THREE.Scene();


// Create Camera
const fov = 65;
const near = 0.01;
const far = 1000.0;
const aspect = window.innerWidth / window.innerHeight;
// camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 2000);
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 1.6, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create WebGL Renderer
renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Create FPS camera control
controls = new PointerLockControls(camera, document.body);
controls.connect();


document.body.appendChild(renderer.domElement);
//movement
document.body.addEventListener('keydown', onKeyDown, false);
document.body.addEventListener('keyup', onKeyUp, false);
//lock cursor
document.body.addEventListener( 'mousedown', onMouseDown, false );

// cerate room at x=0, z=0. Dimension: w=10, l=10, h=4.5 meters
createRoom(0, 0, 10, 20, 4.5);
// Draw some random boxes for fun
drawBoxesRandom(0);

// Add lights
let light = new THREE.AmbientLight(0x101010, 2);
scene.add(light);


function createLightGrid(centerX, centerY, centerZ, w, l, wCount, lCount, color, intensity, distance) {
    let gapW = w / wCount;
    let gapL = l / lCount;
    let startW = centerX - (w / 2) + (gapW / 2);
    let startL = centerZ - (l / 2) + (gapL / 2);
    let x = startW, y = centerY, z = startL;

    const groupLight = new THREE.Group();

    for (let iw = 0; iw < wCount; iw++) {
        for (let il = 0; il < lCount; il++) {
            let lightN = new THREE.PointLight(color, intensity, distance);
            lightN.position.set(x, y, z);
            lightN.castShadow = true;

            //Set up shadow properties for the light
            lightN.shadow.mapSize.width = 512; // default
            lightN.shadow.mapSize.height = 512; // default
            lightN.shadow.camera.near = 0.5; // default
            lightN.shadow.camera.far = 500; // default

            groupLight.add(lightN);
            z = z + gapL;
        }
        x = x + gapW;
        z = startL;
    }

    scene.add(groupLight);
    return groupLight;
}

createLightGrid(0, 4, 0, 10, 20, 3, 3, 0xff1280, 1, 10);


//Is camera reached the maximum Z position?
var is_max_reached = false;
var camera_automove = false;
function animate() {

	if (camera_automove === true) {
		if (camera.position.z < -(floor_length)) {
			is_max_reached = true;
		}

		if (camera.position.z >= 60) {
			is_max_reached = false;
		}

		if (is_max_reached == true)
			camera.position.z += 0.2;
		else
			camera.position.z -= 0.2;
	}
	handleMovement();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}


function drawBoxesRandom(box_cnt) {
    for (let x = -5; x < 5; x=x+2) {
        for (let y = -5; y < 5; y=y+2) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(.3, 1.6, 0.3),
                new THREE.MeshStandardMaterial({
                    color: 0x808080,
                }));
            box.position.set(x, 1.6/2, y);
            box.castShadow = true;
            box.receiveShadow = true;
            scene.add(box);
        }
    }

}

function spawnExhibits() {

}

function createRoom(posX, posZ, width, length, height) {

    const groupRoomElements = new THREE.Group();

    // Create a floor
    const tfFloor = 5;    // Floor texture tiling factor
    const textureFloor = new THREE.TextureLoader().load('WoodFloor034_2K-JPG/WoodFloor034_2K_Color.jpg');
    const normalFloor = new THREE.TextureLoader().load('WoodFloor034_2K-JPG/WoodFloor034_2K_NormalGL.jpg');
    const roughnessFloor = new THREE.TextureLoader().load('WoodFloor034_2K-JPG/WoodFloor034_2K_Roughness.jpg');
    const aoFloor = new THREE.TextureLoader().load('WoodFloor034_2K-JPG/WoodFloor034_2K_AmbientOcclusion.jpg');

    textureFloor.wrapS = THREE.RepeatWrapping;
    textureFloor.wrapT = THREE.RepeatWrapping;
    textureFloor.repeat.set(width/tfFloor, length/tfFloor);
    normalFloor.wrapS = THREE.RepeatWrapping;
    normalFloor.wrapT = THREE.RepeatWrapping;
    normalFloor.repeat.set(width/tfFloor, length/tfFloor);
    roughnessFloor.wrapS = THREE.RepeatWrapping;
    roughnessFloor.wrapT = THREE.RepeatWrapping;
    roughnessFloor.repeat.set(width/tfFloor, length/tfFloor);
    aoFloor.wrapS = THREE.RepeatWrapping;
    aoFloor.wrapT = THREE.RepeatWrapping;
    aoFloor.repeat.set(width/tfFloor, length/tfFloor);

    const geoFloor = new THREE.PlaneGeometry(width, length, 10, 10);
    const matFloor = new THREE.MeshStandardMaterial({
        map: textureFloor,
        normalMap: normalFloor,
        roughnessMap: roughnessFloor,
        aoMap: aoFloor,
        roughness: .5
    });
    const floor = new THREE.Mesh( geoFloor, matFloor );
    floor.position.set(posX, 0, posZ)
    floor.castShadow = false;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;

    // Create ceiling
    const tfCeiling = 8;    // Ceiling texture tiling factor
    const textureCeiling = new THREE.TextureLoader().load('OfficeCeiling001_2K-JPG/OfficeCeiling001_2K_Color.jpg');
    const normalCeiling = new THREE.TextureLoader().load('OfficeCeiling001_2K-JPG/OfficeCeiling001_2K_NormalGL.jpg');
    const roughnessCeiling = new THREE.TextureLoader().load('OfficeCeiling001_2K-JPG/OfficeCeiling001_2K_Roughness.jpg');
    const aoCeiling = new THREE.TextureLoader().load('OfficeCeiling001_2K-JPG/OfficeCeiling001_2K_AmbientOcclusion.jpg');

    textureCeiling.wrapS = THREE.RepeatWrapping;
    textureCeiling.wrapT = THREE.RepeatWrapping;
    textureCeiling.repeat.set(width/tfCeiling, length/tfCeiling);
    normalCeiling.wrapS = THREE.RepeatWrapping;
    normalCeiling.wrapT = THREE.RepeatWrapping;
    normalCeiling.repeat.set(width/tfCeiling, length/tfCeiling);
    roughnessCeiling.wrapS = THREE.RepeatWrapping;
    roughnessCeiling.wrapT = THREE.RepeatWrapping;
    roughnessCeiling.repeat.set(width/tfCeiling, length/tfCeiling);
    aoCeiling.wrapS = THREE.RepeatWrapping;
    aoCeiling.wrapT = THREE.RepeatWrapping;
    aoCeiling.repeat.set(width/tfCeiling, length/tfCeiling);

    const matCeiling = new THREE.MeshStandardMaterial({
        map: textureCeiling,
        normalMap: normalCeiling,
        roughnessMap: roughnessCeiling,
        aoMap: aoCeiling,
        side: THREE.DoubleSide
    });
    const ceiling = floor.clone();
    ceiling.material.dispose();
    ceiling.material = matCeiling;
    ceiling.position.y = height;

    // Create 4 walls
    const tfWall = 2;   // Wall texture tiling factor
    // Create the base wall
    // NOTE: use async loader if any error is observed. See: https://discourse.threejs.org/t/cloning-texture/14969/2
    const textureWall = new THREE.TextureLoader().load('Bricks019_2K-JPG/Bricks019_2K_Color.jpg');
    const normalWall = new THREE.TextureLoader().load('Bricks019_2K-JPG/Bricks019_2K_NormalGL.jpg');
    const roughnessWall = new THREE.TextureLoader().load('Bricks019_2K-JPG/Bricks019_2K_Roughness.jpg');
    const aoWall = new THREE.TextureLoader().load('Bricks019_2K-JPG/Bricks019_2K_AmbientOcclusion.jpg');

//     textureWall.anisotropy = 16;
    textureWall.wrapS = THREE.RepeatWrapping;
    textureWall.wrapT = THREE.RepeatWrapping;
    textureWall.repeat.set(width/tfWall, height/tfWall);
    normalWall.wrapS = THREE.RepeatWrapping;
    normalWall.wrapT = THREE.RepeatWrapping;
    normalWall.repeat.set(width/tfWall, height/tfWall);
    roughnessWall.wrapS = THREE.RepeatWrapping;
    roughnessWall.wrapT = THREE.RepeatWrapping;
    roughnessWall.repeat.set(width/tfWall, height/tfWall);
    aoWall.wrapS = THREE.RepeatWrapping;
    aoWall.wrapT = THREE.RepeatWrapping;
    aoWall.repeat.set(width/tfWall, height/tfWall);

    const geoWall1 = new THREE.PlaneGeometry(width, height, 10, 10);
    const matWall1 = new THREE.MeshStandardMaterial({
        map: textureWall,
        normalMap: normalWall,
        roughnessMap: roughnessWall,
        aoMap: aoWall,
        side: THREE.DoubleSide
    });
    const wall1 = new THREE.Mesh( geoWall1, matWall1 );
    wall1.position.set(posX, height/2, posZ - length/2)
    wall1.castShadow = false;
    wall1.receiveShadow = true;

    // Copy the base wall and put it to the opposite side of the room
    const wall2 = wall1.clone()
    wall2.rotation.y = Math.PI;
    wall2.position.set(posX, height/2, posZ + length/2)

    // Copy the base wall but dispose the geometry, texture, material and create new ones.
    // Put it to 90 degree w.r.t base wall
    const newTextureWall = textureWall.clone(); // Cloning existing material is recommended than loading it again
    const newNormalWall = normalWall.clone();
    const newRoughnessWall = roughnessWall.clone();
    const newAoWall = aoWall.clone();

    newTextureWall.repeat.set(length/tfWall, height/tfWall);
    newNormalWall.repeat.set(length/tfWall, height/tfWall);
    newRoughnessWall.repeat.set(length/tfWall, height/tfWall);
    newAoWall.repeat.set(length/tfWall, height/tfWall);

    const newMatWall = new THREE.MeshStandardMaterial({
        map: newTextureWall,
        normalMap: newNormalWall,
        roughnessMap: newRoughnessWall,
        aoMap: newAoWall,
        side: THREE.DoubleSide
    });

    const newGeoWall = new THREE.PlaneGeometry(length, height, 10, 10);
    const wall3 = wall1.clone()
    wall3.geometry.dispose();
    wall3.geometry = newGeoWall;
    wall3.material.dispose();
    wall3.material = newMatWall;
    wall3.rotation.y = 3 * Math.PI / 2; // To make sure correct normals are facing
    wall3.position.set(posX + width/2, height/2, posZ)

    // Copy the previous wall and put it to the opposite side of the room
    const wall4 = wall3.clone()
    wall4.rotation.y = Math.PI / 2; // To make sure correct normals are facing
    wall4.position.set(posX - width/2, height/2, posZ)


    // Add all elements of the room into a group
    groupRoomElements.add(floor);
    groupRoomElements.add(ceiling);
    groupRoomElements.add(wall1);
    groupRoomElements.add(wall2);
    groupRoomElements.add(wall3);
    groupRoomElements.add(wall4);
    // Now add the group into our scene
    scene.add(groupRoomElements);

    return groupRoomElements;
}


//Jump not implemented yet
//Lock cursor on click
function onMouseDown(event) {
    switch ( event.button )
    {
        //left click
        case 0:
            controls.lock();
            break;

        //right click
        case 2:
            controls.unlock();
            break;
    }
}


//Forward/backword movement
//esc to unlock cursor
//enter to lock cursor
function onKeyDown() {
	switch (event.keyCode)
	{
		case 83: // S
			canMoveBackward = true;
			break;
		case 87: // W
			canMoveForward = true;
			break;
        case 65: // A
			canMoveLeft = true;
			break;
		case 68: // D
			canMoveRight = true;
            break
		case 27: // space
			canJump = true;
		case 27: // esc
			controls.unlock();
			break;
		case 13: // Enter
			controls.lock();
			break;
	}
}


function onKeyUp() {
	switch (event.keyCode)
	{
		case 83: // S
			canMoveBackward = false;
			break;
		case 87: // W
			canMoveForward = false;
			break;
        case 65: // A
			canMoveLeft = false;
			break;
		case 68: // D
			canMoveRight = false;
			break;
		case 27: // space
			canJump = false;
	}
}


function handleMovement() {
	if (canMoveForward)
		controls.moveForward(velocityForward);
	if (canMoveBackward)
		controls.moveForward(-velocityBackward);
	if (canMoveRight)
		controls.moveRight(velocityRight);
	if (canMoveLeft)
		controls.moveRight(-velocityLeft);
}

//Finally animate
animate();
