var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var gui = new dat.GUI();
var dLight;
var aLight;
var sObject;

var renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer   : true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 1);
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

var mouseState = false;
var mouseMoved = false;
var moveStep = 0.1;
var rotateStep = 1;
var mousePosition;
var selectedObject = null;

var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 0, 5 );
directionalLight.castShadow = true;
directionalLight.shadowCameraVisible = true;
scene.add( directionalLight );

function initScene(){
  var texture = THREE.ImageUtils.loadTexture( "textures/eye.jpg" );
  var geometry = new THREE.SphereGeometry( 1, 32, 32 );
  var material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture } );
  var object = new THREE.Mesh( geometry, material );
  object.castShadow = object.receiveShadow = true;
  scene.add( object );

  geometry = new THREE.CubeGeometry(50,80,10);
  material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
  object = new THREE.Mesh( geometry, material ); 
  object.position.z = -10;
  object.castShadow = object.receiveShadow = true;
  scene.add(object);

};

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

camera.position.y = 5;

camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3( 0, 1, 0 ));

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

function render() {
  requestAnimationFrame( render );
  //cube.rotation.x += 0.1;
  //cube.rotation.y += 0.1;
  renderer.render( scene, camera );
}

render();

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

var positionFolder;
var scaleFolder;
var rotationFolder;

function initGui(){
  aLight = gui.addFolder('Ambient Light');
  aLight.add(ambientLight, 'visible');
  aLight.addColor(ambientLight, 'color');
  dLight = gui.addFolder('Directional Light');
  dLight.add(directionalLight, 'visible');
  dLight.add(directionalLight, 'intensity', 0, 10);
  dLight.add(directionalLight.position, "x", -100, 100);
  dLight.add(directionalLight.position, "y", -100, 100);
  dLight.add(directionalLight.position, "z", -100, 100);
  dLight.addColor(directionalLight, "color");
  sObject = gui.addFolder('Selected Object');
  positionFolder = sObject.addFolder("Position");
  scaleFolder = sObject.addFolder("Scale");
  rotationFolder = sObject.addFolder("Rotation");
}

var positionX;
var positionY;
var positionZ;
var scaleX;
var scaleY;
var scaleZ;
var rotationX;
var rotationY;
var rotationZ;
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

initScene();
initGui();
