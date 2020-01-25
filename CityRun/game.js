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

var container;
var car;

var controls, time = Date.now();

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
	ground.doubleSided = true; 
	ground.receivedShadow = true;
	scene.add(ground); 

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

		object.root.add( camera );

		camera.position.set( 0, 10, -30 );

		object.bodyMesh.geometry.dynamic = true;
		object.bodyMesh.geometry.computeFaceNormals();
	}
	car.setVisible( true );
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
 
function animate() {

  	requestAnimationFrame(animate);
  	car.updateCarModel( Date.now() - time, carControl );
  	render();

  	time = Date.now();

}

function render() {

	renderer.render( scene, camera );
}