var camera, scene, renderer, clock, stats;
var dirLight, spotLight, ambient, hemiLight;
var torusKnot, cube;
var mouseState = false;
var mouseMoved = false;
var moveStep = 1;
var rotateStep = 1;
var mousePosition;
var selectedObject = null;
var gui = new dat.GUI();
var dLight, aLight, sObject;
var positionX, positionY, positionZ;
var scaleX, scaleY, scaleZ;
var rotationX, rotationY, rotationZ;
var positionFolder, scaleFolder, rotationFolder;
var sky, sunSphere;

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

  // Lights
  ambient = new THREE.AmbientLight( 0x404040 );
  scene.add( ambient );

  spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( 10, 10, 5 );
  spotLight.castShadow = true;
  spotLight.shadowCameraNear = 8;
  spotLight.shadowCameraFar = 30;
  spotLight.shadowDarkness = 0.5;
  spotLight.shadowCameraVisible = true;
  spotLight.shadowMapWidth = 1024;
  spotLight.shadowMapHeight = 1024;
  spotLight.name = 'Spot Light';
  scene.add( spotLight );

  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.set( 0, 10, 0 );
  dirLight.castShadow = true;
  dirLight.shadowCameraNear = 0.01;
  dirLight.shadowCameraFar = 10;
  dirLight.shadowCameraRight = 15;
  dirLight.shadowCameraLeft = -15;
  dirLight.shadowCameraTop	= 15;
  dirLight.shadowCameraBottom = -15;
  dirLight.shadowDarkness = 0.5;
  dirLight.shadowCameraVisible = true;
  dirLight.shadowMapWidth = 1024;
  dirLight.shadowMapHeight = 1024;
  dirLight.name = 'Dir. Light';
  scene.add( dirLight );

  // Geometry
  var geometry = new THREE.TorusKnotGeometry( 25, 8, 75, 20 );
  var material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );

  torusKnot = new THREE.Mesh( geometry, material );
  torusKnot.scale.multiplyScalar( 1 / 18 );
  torusKnot.position.y = 3;
  torusKnot.castShadow = true;
  torusKnot.receiveShadow = true;
  scene.add( torusKnot );

  geometry = new THREE.BoxGeometry( 3, 3, 3 );
  material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  cube = new THREE.Mesh( geometry, material );
  cube.position.set( 8, 3, 8 );
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add( cube );

  var geometry = new THREE.BoxGeometry( 1000, 0.15, 1000 );
  var material = new THREE.MeshPhongMaterial( {
    color: 0xa0adaf,
    shininess: 150,
    specular: 0xffffff,
    shading: THREE.SmoothShading
  } );

  var ground = new THREE.Mesh( geometry, material );
  ground.scale.multiplyScalar( 3 );
  ground.castShadow = false;
  ground.receiveShadow = true;
  scene.add( ground );

  var obj;
  geometry = new THREE.BoxGeometry( 3, 3, 3 );
  material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    shininess: 150,
    specular: 0x222222,
    shading: THREE.SmoothShading,
  } );
  obj = new THREE.Mesh( geometry, material );
  obj.position.set( 8, 3, 8 );
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add( obj );

  //texture
  var texture = THREE.ImageUtils.loadTexture( "textures/tank.jpg" );

  // 载入一个物体
  var loader = new MyObjLoader();
  //绑定监听，载入obj完成后回调函数
  loader.addEventListener( 'load', function ( event ) {
    var object = event.content;
    //给物体加上纹理
    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material.map = texture;
      }
    } );
    object.scale.multiplyScalar(0.1);
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
}
