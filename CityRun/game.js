// --------------------------------------------- //
// ------- City Run built with Three.JS -------- //
// --------- Created by Daiwei Wang ------------ //
// -------- Three.JS is by Mr. doob  ----------- //
// --------------------------------------------- //

// ------------------------------------- //
// ------- GLOBAL VARIABLES ------------ //
// ------------------------------------- //

// scene object variables
var renderer, scene, ground, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200;

var maxSpeed = 0.05, acceleration = 0.01;

var container, stats;
var camera, scene, renderer;
var car, velocity, angle;
var carAmmo;

var parameters = {
	width: 2000,
	height: 2000,
	widthSegments: 250,
	heightSegments: 250,
	depth: 1500,
	param: 4,
	filterparam: 1
}

var carParameters = {
	maxForwardSpeed: 0.05,
	maxSideSpeed: 0.01,
	maxBackwardSpeed: 0.02,
	power: 0,
	acceleration: 0.002,
	friction: 0.001,
	angle: 0.0,
	velocityAngle: 0.0,
	turning: 0.0,
	vz: 0.0,
	vx: 0.0
}

// var carControl = {
// 	moveForward: false,
// 	moveBackward: false,
// 	moveLeft: false,
// 	moveRight: false
// }

var controls, time = Date.now();
var carBody, timeStep = 1/60;
var cube;

// -------------------------------- //
// ------- GAME FUNCTIONS --------- //
// -------------------------------- //

function setup()
{

	// initCannon();
	// set up all the 3D objects in the scene	
	createScene();
	
	animate();
}



function createScene()
{
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML = "";

	}

	// set the scene size
	var WIDTH = window.innerWidth,
	  HEIGHT = 500;

	// container = document.createElement( 'div' );
	// document.body.appendChild( container );

	container = document.getElementById("gameCanvas");

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, HEIGHT );
	container.appendChild( renderer.domElement );

	// Environment camera
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / HEIGHT, 0.1, 30000 );
	camera.position.set( 0, 2, -7 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	// Mouse control
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.userPan = false;
	controls.userPanSpeed = 0.0;
	controls.maxDistance = 5000.0;
	controls.maxPolarAngle = Math.PI * 0.495;

	// Light
	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
	directionalLight.position.set( 0, 500, - 500 );
	scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
	directionalLight.position.set( - 500, 500, 500 );
	scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 500, 500, 500 );

	// directionalLight.castShadow = true;
	// directionalLight.shadowCameraNear = 50;
	// directionalLight.shadowCameraFar = camera.far*2;
	// directionalLight.shadowCameraRight     =  3000;
	// directionalLight.shadowCameraLeft      = -3000;
	// directionalLight.shadowCameraTop       =  3000;
	// directionalLight.shadowCameraBottom    = -3000;
	// directionalLight.shadowBias = 0.0001;
	// directionalLight.shadowDarkness = 0.7;
	// directionalLight.shadowMapWidth = 2048;
	// directionalLight.shadowMapHeight = 2048;
	scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 0, 50000, 0 );
	scene.add( directionalLight );

	// load skybox
	var cubeMap = new THREE.Texture( [] );
	cubeMap.format = THREE.RGBFormat;
	cubeMap.flipY = false;

	var loader = new THREE.ImageLoader();
	loader.load( 'textures/skyboxsun25degtest.png', function ( image ) {

		var getSide = function ( x, y ) {

			var size = 1024;

			var canvas = document.createElement( 'canvas' );
			canvas.width = size;
			canvas.height = size;

			var context = canvas.getContext( '2d' );
			context.drawImage( image, - x * size, - y * size );

			return canvas;

		};

		cubeMap.image[ 0 ] = getSide( 2, 1 ); // px
		cubeMap.image[ 1 ] = getSide( 0, 1 ); // nx
		cubeMap.image[ 2 ] = getSide( 1, 0 ); // py
		cubeMap.image[ 3 ] = getSide( 1, 2 ); // ny
		cubeMap.image[ 4 ] = getSide( 1, 1 ); // pz
		cubeMap.image[ 5 ] = getSide( 3, 1 ); // nz
		cubeMap.needsUpdate = true;

	} );

	var cubeShader = THREE.ShaderLib['cube'];
	cubeShader.uniforms['tCube'].value = cubeMap;

	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: cubeShader.fragmentShader,
		vertexShader: cubeShader.vertexShader,
		uniforms: cubeShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

	var skyBox = new THREE.Mesh(
		new THREE.BoxGeometry( 10000, 10000, 10000 ),
		skyBoxMaterial
	);
	
	scene.add( skyBox );

	//add ground 
	var grassTex = THREE.ImageUtils.loadTexture('textures/grass.png'); 
	grassTex.wrapS = THREE.RepeatWrapping; 
	grassTex.wrapT = THREE.RepeatWrapping; 
	grassTex.repeat.x = 256; 
	grassTex.repeat.y = 256; 
	var groundMat = new THREE.MeshBasicMaterial({map:grassTex}); 

	var groundGeo = new THREE.PlaneGeometry(4000,4000); 

	ground = new THREE.Mesh(groundGeo,groundMat); 
	ground.position.y = -3; //lower it 
	ground.rotation.x = -Math.PI/2; //-90 degrees around the xaxis 
	//IMPORTANT, draw on both sides 
	ground.doubleSided = true; 
	ground.receivedShadow = true;
	scene.add(ground); 

	// var geometry = new THREE.CubeGeometry( 0.01, 0.01, 0.01 );
	// var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
	// cube = new THREE.Mesh( geometry, material );
	// cube.position.set( 0, 0, 0 );
	// cube.rotation.set( 0, 0, 0 );
	// scene.add( cube );

	//load a car
	angle = 0;	 
	velocity = 0.03;
	//IMPORTANT: be sure to use ./ or it may not load the .bin correctly 
	// new THREE.JSONLoader().load( './models/Audi_Car/Audi.js', function( geometry, materials ) { 
	// 	geometry.computeVertexNormals();
	// 	var material = new THREE.MeshFaceMaterial( materials );
	//     var mesh = new THREE.Mesh( geometry, material );
	// 	mesh.scale.set( 0.1, 0.1, 0.1 );
	// 	mesh.position.set( 0, 0, 0 );
	// 	mesh.rotation.set( 0, 0, 0 );
	// 	mesh.castShadow = true;

	//     scene.add( mesh ); 

	//     car = mesh; 
	//     car.add( camera );

	//     // controls = new PointerLockControls( car , carBody );
	//     // scene.add( controls.getObject() );

	// }); 
	car = new THREE.Car();
	car.modelScale = 1;
	car.backWheelOffset = 2;
	car.callback = function( object ) {
		var x = 270;
		var y = 0.1;
		var z = -330;
		// var s = 0.01;
		object.root.position.set( x, y, z );
		scene.add( object.root );

		// object.enableShadows( true );

		object.root.add( camera );

		camera.position.set( 0, 10, -50 );
		//camera.position.set( 0, 3000, -500 );

		object.bodyMesh.geometry.dynamic = true;
		object.bodyMesh.geometry.computeFaceNormals();

		// cameraTarget.z = 500;
		// cameraTarget.y = 150;

		// camera.lookAt( cameraTarget );

		// object.bodyMesh.geometry.computeBoundingBox();
		// var bb = object.bodyMesh.geometry.boundingBox;

		// var ss = object.modelScale * 1.1;
		// var shadowWidth  =        ss * ( bb.max.z - bb.min.z );
		// var shadowHeight = 1.25 * ss * ( bb.max.x - bb.min.x );

		// var shadowPlane = new THREE.PlaneGeometry( shadowWidth, shadowHeight );
		// var shadowMaterial = new THREE.MeshBasicMaterial( {
		// 	color: 0xffffff, opacity: 0.5, transparent: true, map: shadowTexture,
		// 	polygonOffset: false, polygonOffsetFactor: -0.5, polygonOffsetUnits: 1
		// } );

		// var shadow = new THREE.Mesh( shadowPlane, shadowMaterial );
		// shadow.position.y = s + 10;
		// shadow.rotation.x = - Math.PI / 2;
		// shadow.rotation.z = Math.PI / 2;

		// object.root.add( shadow );
	}
	car.setVisible( true );
	// car.enableShadows( true );
	car.loadPartsJSON( './models/Audi_Car/audi_body.js', './models/Audi_Car/wheel_left.js' );
	

	new THREE.JSONLoader().load( './models/City_4/City.js', function( geometry, material ) {
		geometry.computeVertexNormals();
		var cityMesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		cityMesh.scale.set( 4, 4, 4 );
		cityMesh.rotation.set( 0, Math.PI / 2, 0 );
		cityMesh.position.set( -0, -2.9, 400 );
		scene.add( cityMesh );
	});

}

function initCannon() {
          
  	world = new CANNON.World();
  	world.gravity.set( 0, -1, 0 );
  	world.broadphase = new CANNON.NaiveBroadphase();
  	// world.defaultContactMaterial.contactEquationStiffness = 1e6;
  	// world.defaultContactMaterial.contactEquationRegularizationTime = 3;
  	world.solver.iterations = 10;
  	world.contactgen.contactReduction=true;

  	var groundMaterial = new CANNON.Material("groundMaterial");
    var carMaterial = new CANNON.Material("carMaterial");
    var carGroundContactMaterial = new CANNON.ContactMaterial( groundMaterial,carMaterial, 0.5, 0.3 );
    carGroundContactMaterial.contactEquationStiffness = 1e9;
    carGroundContactMaterial.contactEquationRegularizationTime = 3;
    world.addContactMaterial(carGroundContactMaterial);

    // Ground 
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.RigidBody( 0, groundShape, groundMaterial );
    groundBody.position.y = -3;
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3( 1, 0, 0 ),-Math.PI/2);
    world.add(groundBody);

 //  	// Ground plane
 //    var plane = new CANNON.Plane();
 //    var groundBody = new CANNON.RigidBody( 0,plane );
 //    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3( 1, 0, 0 ),-Math.PI/2);
 //    // groundBody.position.copy(ground.position);
	// // groundBody.quaternion.copy(ground.quaternion);
 //    world.add(groundBody);

 //    mass = 1;
	// var wheelShape =      new CANNON.Sphere(1.2);
 //    var leftFrontWheel =  new CANNON.RigidBody(mass,wheelShape,wheelMaterial);
 //    var rightFrontWheel = new CANNON.RigidBody(mass,wheelShape,wheelMaterial);
 //    var leftRearWheel =   new CANNON.RigidBody(mass,wheelShape,wheelMaterial);
 //    var rightRearWheel =  new CANNON.RigidBody(mass,wheelShape,wheelMaterial);

 //    var chassisShape = new CANNON.Box(new CANNON.Vec3(5,2,0.5));
 //    var chassis = new CANNON.RigidBody(mass,chassisShape);

 //    // Position constrain wheels
 //    var zero = new CANNON.Vec3();
 //    leftFrontWheel .position.set(  5,  5, 0); 
 //    rightFrontWheel.position.set(  5, -5, 0);
 //    leftRearWheel  .position.set( -5,  5, 0);
 //    rightRearWheel .position.set( -5, -5, 0);

 //    // Constrain wheels
 //    var constraints = [];
    
 //    // Hinge the wheels
 //    var leftAxis =       new CANNON.Vec3(0,1,0);
 //    var rightAxis =      new CANNON.Vec3(0,-1,0);
 //    var leftFrontAxis =  new CANNON.Vec3(0,1,0);
 //    var rightFrontAxis = new CANNON.Vec3(0,-1,0);
 //    if(true){
 //        leftFrontAxis =  new CANNON.Vec3(0.3,0.7,0);
 //        rightFrontAxis = new CANNON.Vec3(-0.3,-0.7,0);
 //        leftFrontAxis.normalize();
 //        rightFrontAxis.normalize();
 //    }

 //    constraints.push(new CANNON.HingeConstraint(chassis, new CANNON.Vec3( 5, 5, 0), leftFrontAxis,  leftFrontWheel,  zero, leftAxis));
 //    constraints.push(new CANNON.HingeConstraint(chassis, new CANNON.Vec3( 5,-5, 0), rightFrontAxis, rightFrontWheel, zero, rightAxis));
 //    constraints.push(new CANNON.HingeConstraint(chassis, new CANNON.Vec3(-5, 5, 0), leftAxis,  leftRearWheel,   zero, leftAxis));
 //    constraints.push(new CANNON.HingeConstraint(chassis, new CANNON.Vec3(-5,-5, 0), rightAxis, rightRearWheel,  zero, rightAxis));

 //    for(var i=0; i<constraints.length; i++)
 //        world.addConstraint(constraints[i]);

 //    var bodies = [chassis,leftFrontWheel,rightFrontWheel,leftRearWheel,rightRearWheel];
 //    for(var i=0; i<bodies.length; i++){
 //        world.add(bodies[i]);
 //    }

 //    // Enable motors and set their velocities
 //    var frontLeftHinge = constraints[2];
 //    var frontRightHinge = constraints[3];
 //    frontLeftHinge.enableMotor();
 //    frontRightHinge.enableMotor();
 //    var v = -14;
 //    frontLeftHinge.motorTargetVelocity = v;
 //    frontRightHinge.motorTargetVelocity = -v;

  	shape = new CANNON.Sphere(new CANNON.Vec3( 0.01, 0.01, 0.01 ));
  	mass = 10;
  	carBody = new CANNON.RigidBody( mass, shape, carMaterial );
  	carBody.position.set( 0, 0, 0 );
  	// carShape.angularVelocity.set(0,10,0);
  	// carShape.angularDamping = 0.5;
  	world.add(carBody);
  
}
 
function animate() {

  	requestAnimationFrame(animate);
  	// updatePhysics();
  	// controls.update( Date.now() - time );
  	// carPhysics( Date.now() - time );
  	car.updateCarModel( Date.now() - time, carControl );
  	render();

  	time = Date.now();

}

function render() {

	// controls.update();
	renderer.render( scene, camera );
}

function carPhysics( delta ) {

	// delta *= 0.1;

	// var velocityFactor = 0.2;
	// var velocity = carBody.velocity;
	// var inputVelocity = new THREE.Vector3();

 //    inputVelocity.set(0,0,0);

 //    if ( Key.isDown(Key.W) ){
 //        inputVelocity.z = -velocityFactor * delta;
 //    }
 //    if ( Key.isDown(Key.S) ){
 //        inputVelocity.z = velocityFactor * delta;
 //    }

 //    if ( Key.isDown(Key.A) ){
 //        inputVelocity.x = -velocityFactor * delta;
 //    }
 //    if ( Key.isDown(Key.D) ){
 //        inputVelocity.x = velocityFactor * delta;
 //    }

 //    var quat = new THREE.Quaternion();
 //    // Convert velocity to world coordinates
 //    quat.setFromEuler( car.rotation );
 //    quat.multiplyVector3( inputVelocity );

 //    // Add to the object
 //    velocity.x += inputVelocity.x;
 //    velocity.z += inputVelocity.z;

 //    carBody.position.copy(car.position);

	// var turning = false;
	// if( Key.isDown(Key.A) ) { 
	// 	// carParameters.turning += Math.PI * 0.2;
	// 	// if ( carParameters.turning > Math.PI * 0.6 ) carParameters.turning = Math.PI * 0.6;
	// 	turning = true;
	//     car.rotation.y += 0.01; 
	//     // carBody.rotation.y += 0.01; 
	//     // carBody.quaternion.setFromAxisAngle( new CANNON.Vec3( 0, 1, 0), 0.01 );
	//     carParameters.angle += 0.01; 
	// }
	// if( Key.isDown(Key.D) ) { 
	// 	// carParameters.turning -= Math.PI * 0.2;
	// 	// if ( carParameters.turning < - Math.PI * 0.6 ) carParameters.turning = - Math.PI * 0.6;
	// 	turning = true;
	//     car.rotation.y -= 0.01; 
	//     // carBody.rotation.y -= 0.01; 
	//     // carBody.quaternion.setFromAxisAngle( new CANNON.Vec3( 0, 1, 0), -0.01 );
 //    	carParameters.angle -= 0.01; 
	// } 
	// if ( turning == false ) {
	// 	carParameters.turning = 0;
	// }

	// if( Key.isDown(Key.W) ) { 
	// 	carParameters.power = 1;
	//     car.position.z += velocity * Math.cos(carParameters.angle); 
 //    	car.position.x += velocity * Math.sin(carParameters.angle); 
 //    	// carBody.position.z += velocity * Math.cos(carParameters.angle); 
 //    	// carBody.position.x += velocity * Math.sin(carParameters.angle); 
	// } else if( Key.isDown(Key.S) ) { 
	// 	carParameters.power = -1;
	//     car.position.z -= velocity * Math.cos(carParameters.angle); 
 //    	car.position.x -= velocity * Math.sin(carParameters.angle); 
 //    	// carBody.position.z -= velocity * Math.cos(carParameters.angle); 
 //    	// carBody.position.x -= velocity * Math.sin(carParameters.angle); 
	// } else {
	// 	carParameters.power = 0;
	// }

	// carParameters.vz += carParameters.power * carParameters.acceleration * Math.cos( carParameters.turning );
	// carParameters.vx += carParameters.power * carParameters.acceleration * Math.sin( carParameters.turning );
	// carParameters.vz += carParameters.az;
	// carParameters.vx += carParameters.ax;
	// if ( carParameters.vz > carParameters.friction ) {
	// 	carParameters.vz -= carParameters.friction;
	// } else if ( carParameters.vz < -carParameters.friction ) {
	// 	carParameters.vz += carParameters.friction;
	// } else {
	// 	carParameters.vz = 0;
	// }
	// if ( carParameters.turning == 0 ) {
	// 	carParameters.vx = 0;
	// }
	// if ( carParameters.vz > carParameters.maxForwardSpeed ) carParameters.vz = carParameters.maxForwardSpeed;
	// if ( carParameters.vx > carParameters.maxSideSpeed ) carParameters.vx = carParameters.maxSideSpeed;
	// if ( carParameters.vz < -carParameters.maxForwardSpeed ) carParameters.vz = -carParameters.maxForwardSpeed;
	// if ( carParameters.vx < -carParameters.maxSideSpeed ) carParameters.vx = -carParameters.maxSideSpeed;
	// if ( carParameters.vz != 0 && carParameters.vx != 0 ) carParameters.angle = Math.atan( carParameters.vx / carParameters.vz );
	// car.position.z += carParameters.vz;
	// car.position.x += carParameters.vx;
	// if ( carParameters.turning != 0 && carParameters.vz != 0 ) car.rotation.y += carParameters.angle;
}

function updatePhysics() {

	// Step the physics world
  	world.step(timeStep);

  	// Copy coordinates from Cannon.js to Three.js
  	carBody.position.copy(car.position);
  	carBody.quaternion.copy(car.quaternion);

}