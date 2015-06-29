var camera, scene, renderer, clock, stats;
var dirLight, spotLight, ambient, hemiLight;
var mouseState = false;
var mouseMoved = false;
var moveStep = 1;
var rotateStep = 1;
var mousePosition;
var selectedObject = null;
var gui = new dat.GUI();
var dLight, aLight, sObject, sLight, hLight;
var positionX, positionY, positionZ;
var scaleX, scaleY, scaleZ;
var oColor;
var rotationX, rotationY, rotationZ;
var positionFolder, scaleFolder, rotationFolder;
var sky, sunSphere;
var torusKnot;

init();
animate();
initGui();

function init() {

  initScene();
  initMisc();

  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );

}

function initScene() {

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );
  camera.position.set( 0, 15, 35 );

  scene = new THREE.Scene();

  scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
  scene.fog.color.setHSL( 0.6, 0, 1 );

  // Lights
  ambient = new THREE.AmbientLight( 0x404040 );
  scene.add( ambient );

  spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( 0, 9, 0 );
  spotLight.castShadow = true;
  spotLight.shadowCameraNear = 3;
  spotLight.shadowCameraFar = 30;
  spotLight.shadowDarkness = 0.5;
  //spotLight.shadowCameraVisible = true;
  spotLight.shadowMapWidth = 256;
  spotLight.shadowMapHeight = 256;
  spotLight.name = 'Spot Light';
  scene.add( spotLight );

  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  scene.add( hemiLight );

  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.set( 20, 20, 20 );
  dirLight.castShadow = true;
  dirLight.shadowCameraNear = 10;
  dirLight.shadowCameraFar = 80;
  dirLight.shadowCameraRight = 50;
  dirLight.shadowCameraLeft = -50;
  dirLight.shadowCameraTop	= 50;
  dirLight.shadowCameraBottom = -50;
  dirLight.shadowDarkness = 0.5;
  //dirLight.shadowCameraVisible = true;
  dirLight.shadowMapWidth = 1024;
  dirLight.shadowMapHeight = 1024;
  dirLight.name = 'Dir. Light';
  scene.add( dirLight );

  var texture = THREE.ImageUtils.loadTexture( "textures/grass.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 100, 100 );
  var geometry = new THREE.BoxGeometry( 1000, 0.15, 1000 );
  var material = new THREE.MeshLambertMaterial( {
    color: 0xa0adaf,
    map: texture,
    shininess: 150,
    specular: 0xffffff,
    shading: THREE.SmoothShading
  } );

  var ground = new THREE.Mesh( geometry, material );
  ground.scale.multiplyScalar( 3 );
  ground.castShadow = false;
  ground.receiveShadow = true;
  scene.add( ground );

  var vertexShader = document.getElementById( 'vertexShader' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
  var uniforms = {
    topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
    bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
    offset:		 { type: "f", value: 33 },
    exponent:	 { type: "f", value: 0.6 }
  }
  uniforms.topColor.value.copy( hemiLight.color );

  scene.fog.color.copy( uniforms.bottomColor.value );

  var skyGeo = new THREE.SphereGeometry( 500, 32, 15 );
  var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

  var sky = new THREE.Mesh( skyGeo, skyMat );
  scene.add( sky );

  var obj;
  geometry = new THREE.BoxGeometry( 3, 0.2, 3 );
  material = new THREE.MeshLambertMaterial( {
    color: 0x6e98f8,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 0, 9, 0 );
  //obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  texture = THREE.ImageUtils.loadTexture( "textures/wood.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 2, 1 );
  geometry = new THREE.BoxGeometry( 1, 10, 50 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( -17, 5, -6 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 1, 10, 50 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 16, 5, -6 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 32, 10, 1 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( -0.5, 5, 18.5 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 13, 10, 1 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( -10, 5, -31 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 13, 10, 1 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 10, 5, -31 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 7, 1, 1 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 0, 9.5, -31 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  var video = document.getElementById( 'video' );
  texture = new THREE.VideoTexture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  geometry = new THREE.BoxGeometry( 0.1, 3, 4 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( -16.5, 5, -6 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );


  texture = THREE.ImageUtils.loadTexture( "textures/wood.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4, 4 );
  geometry = new THREE.BoxGeometry( 32, 1, 50 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    map: texture,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( -0.5, 9.5, -6 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.BoxGeometry( 2, 2, 2 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, -15 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.SphereGeometry( 1, 32, 32 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, -10 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.CylinderGeometry( 1, 1, 3, 32 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, -5 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.CylinderGeometry( 0, 1, 3, 32 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, 0 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.CylinderGeometry( 1, 1, 3, 6 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, 5 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.CylinderGeometry( 0, 1, 3, 6 );
  material = new THREE.MeshLambertMaterial( {
    color: 0xffffff,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, 10 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
  material = new THREE.MeshPhongMaterial( {
    color: 0x000088,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  torusKnot = new THREE.Mesh( geometry, material );
  torusKnot.castShadow = true;
  torusKnot.receiveShadow = true;
  torusKnot.position.set( 0, 3, 0 );
  torusKnot.scale.multiplyScalar(0.1);
  scene.add( torusKnot );

  //texture
  texture = THREE.ImageUtils.loadTexture( "textures/tank.jpg" );

  // 载入一个物体
  var loader = new MyObjLoader();
  //绑定监听，载入obj完成后回调函数
  loader.addEventListener( 'load', function ( event ) {
    var tankMaterial = new THREE.MeshLambertMaterial();
    var tankGeo=event.content;
    var object = new THREE.Mesh(tankGeo,tankMaterial);
    //给物体加上纹理
    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material.map = texture;
      }
    } );
    object.scale.multiplyScalar(0.5);
    object.position.y = 1;
    object.position.x = 50;
    scene.add( object );
  });
  //相对路径载入obj
  loader.load( 'obj/tank.obj' );
}

function initMisc() {

  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer   : true
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x000000 );
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.BasicShadowMap;

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );
  render();

}

function renderScene() {

  torusKnot.rotation.x += 0.1;
  torusKnot.rotation.y += 0.1;
  torusKnot.rotation.z += 0.1;
  renderer.render( scene, camera );

}

function render() {

  renderScene();

}

camera.eye = new THREE.Vector3(0,1,0);

camera.moveEye = function(x, y, z){
  var vector = this.eye.clone().sub(this.position);
  vector.normalize();
  var zVector = vector.clone().multiplyScalar(z);
  this.eye.add(zVector);
  this.position.add(zVector);
  var xVector = vector.clone().cross(this.up).multiplyScalar(x);
  this.eye.add(xVector);
  this.position.add(xVector);
  var yVector = this.up.clone().multiplyScalar(y);
  this.eye.add(yVector);
  this.position.add(yVector);
  this.lookAt(this.eye);
};

camera.rotateEye = function(x, y){
  var vector = this.eye.clone().sub(this.position);
  vector.normalize();
  var xVector = vector.clone().cross(this.up);
  this.eye.add(this.up.clone().multiplyScalar(y));
  this.eye.add(xVector.clone().multiplyScalar(x));
  vector = this.eye.clone().sub(this.position);
  vector.normalize();
  this.eye.addVectors(this.position, vector);
  //this.up.crossVectors(xVector, vector).normalize();
  this.lookAt(this.eye);
};

function moveSelectedObject(x, y, z){
  if (selectedObject == null)
    return;
  var vector = camera.eye.clone().sub(camera.position);
  vector.normalize();
  var zVector = vector.clone().multiplyScalar(z);
  selectedObject.position.add(zVector);
  var xVector = vector.clone().cross(camera.up).multiplyScalar(x);
  selectedObject.position.add(xVector);
  var yVector = camera.up.clone().multiplyScalar(y);
  selectedObject.position.add(yVector);
};

document.onkeydown=function(event){
  var e = event || window.event || arguments.callee.caller.arguments[0];
  if(!e)
    return;
  switch (e.keyCode) {
    case 37: //left
      moveSelectedObject(-moveStep, 0, 0);
    break;
    case 38: //up
      moveSelectedObject(0, moveStep, 0);
    break;
    case 39: //right
      moveSelectedObject(moveStep, 0, 0);
    break;
    case 40: //down
      moveSelectedObject(0, -moveStep, 0);
    break;
    case 65: //a
      camera.moveEye(-moveStep, 0, 0);
    break;
    case 68: //d
      camera.moveEye(moveStep, 0, 0);
    break;
    case 80: //p
      var img = convertCanvasToImage(document.getElementsByTagName("canvas")[0]);
    window.open(img.src);
    break;
    case 83: //s
      camera.moveEye(0, 0, -moveStep);
    break;
    case 87: //w
      camera.moveEye(0, 0, moveStep);
    break;
    default:
      break;
  }
}; 

function mouseCoords(event)
{ 
  var mouse = {x: 0, y: 0};
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
  return mouse;
  //if(ev.pageX || ev.pageY){ 
  //return {x:ev.pageX, y:ev.pageY}; 
  //} 
  //return { 
  //x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
  //y:ev.clientY + document.body.scrollTop - document.body.clientTop 
  //}; 
};

document.onmousedown=function(event){
  var e = event || window.event || arguments.callee.caller.arguments[0];
  if(!e)
    return;
  var obj=document.elementFromPoint(event.clientX,event.clientY);
  if(obj.tagName != "CANVAS")
    return;
  mouseState = true;
  mousePosition = mouseCoords(event); 
  mouseMoved = false;
};

document.onmouseup=function(event){
  var e = event || window.event || arguments.callee.caller.arguments[0];
  if(!e)
    return;
  var obj=document.elementFromPoint(event.clientX,event.clientY);
  mouseState = false;
  if(obj.tagName != "CANVAS")
    return;
  var mousePos = mouseCoords(event);
  var mouse = new THREE.Vector2(mousePos.x, mousePos.y);
  if(!mouseMoved){
    if(selectedObject != null){
      selectedObject.material.opacity = 1;
      selectedObject.material.transparent = false;
      selectedObject = null;
    }
    var raycaster = new THREE.Raycaster();

    // update the picking ray with the camera and mouse position	
    raycaster.setFromCamera( mouse, camera );	

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );

    if(intersects.length > 0){
      //intersects[ 0 ].object.material.color.set( 0xFFFFFF );
      intersects[ 0 ].object.material.opacity = 0.5;
      intersects[ 0 ].object.material.transparent = true;
      selectedObject = intersects[0].object;
      updateGui();
    }
  }
};

document.onmousemove = function(ev) 
{ 
  ev= ev || window.event; 
  var mousePos = mouseCoords(ev); 
  if(!mouseState)
    return;
  camera.rotateEye((mousePos.x - mousePosition.x)*rotateStep, (mousePos.y - mousePosition.y)*rotateStep);
  mousePosition = mousePos;
  mouseMoved = true;
}; 

// Converts canvas to an image
function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}


function initGui(){
  aLight = gui.addFolder('Ambient Light');
  aLight.add(ambient, 'visible');
  aLight.addColor(ambient, 'color');

  dLight = gui.addFolder('Directional Light');
  dLight.add(dirLight, 'visible');
  dLight.add(dirLight, 'intensity', 0, 10);
  dLight.add(dirLight.position, "x", -100, 100);
  dLight.add(dirLight.position, "y", -100, 100);
  dLight.add(dirLight.position, "z", -100, 100);
  dLight.addColor(dirLight, "color");

  hLight = gui.addFolder('HemiSpere Light');
  hLight.add(hemiLight, 'visible');
  hLight.add(hemiLight, 'intensity', 0, 10);
  hLight.addColor(hemiLight, "groundColor");

  sLight = gui.addFolder('Spot Light');
  sLight.add(spotLight, 'visible');
  sLight.add(spotLight, 'intensity', 0, 10);
  sLight.add(spotLight.position, "x", -100, 100);
  sLight.add(spotLight.position, "y", -100, 100);
  sLight.add(spotLight.position, "z", -100, 100);
  sLight.addColor(spotLight, "color");

  sObject = gui.addFolder('Selected Object');
  positionFolder = sObject.addFolder("Position");
  scaleFolder = sObject.addFolder("Scale");
  rotationFolder = sObject.addFolder("Rotation");
}

function updateGui(){
  if(selectedObject == null)
    return;
  if(scaleX){
    positionFolder.remove(positionX);
    positionFolder.remove(positionY);
    positionFolder.remove(positionZ);
    scaleFolder.remove(scaleX);
    scaleFolder.remove(scaleY);
    scaleFolder.remove(scaleZ);
    rotationFolder.remove(rotationX);
    rotationFolder.remove(rotationY);
    rotationFolder.remove(rotationZ);
    if(oColor)
      sObject.remove(oColor);
  }

  positionX = positionFolder.add(selectedObject.position, "x");
  positionY = positionFolder.add(selectedObject.position, "y");
  positionZ = positionFolder.add(selectedObject.position, "z");
  scaleX = scaleFolder.add(selectedObject.scale, "x", 0, 10);
  scaleY = scaleFolder.add(selectedObject.scale, "y", 0, 10);
  scaleZ = scaleFolder.add(selectedObject.scale, "z", 0, 10);
  rotationX = rotationFolder.add(selectedObject.rotation, "x", 0, 180);
  rotationY = rotationFolder.add(selectedObject.rotation, "y", 0, 180);
  rotationZ = rotationFolder.add(selectedObject.rotation, "z", 0, 180);
  if (selectedObject.material.color != null)
    oColor = sObject.addColor(selectedObject.material, 'color');
  else
    oColor = null;
}
