var carControl = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false
}

function onKeyDown(event) 
{
  switch(event.keyCode) 
  {
    case 87: /*W*/
    case 38: /*up*/ carControl.moveForward = true; break;

    case 83: /*S*/
    case 40: /*down*/carControl.moveBackward = true; break;

    case 65: /*A*/
    case 37: /*left*/carControl.moveLeft = true; break;

    case 68: /*D*/
    case 39: /*right*/carControl.moveRight = true; break;
  }
};

function onKeyUp(event) 
{
  switch(event.keyCode) 
  {
    case 87: /*W*/
    case 38: /*up*/ carControl.moveForward = false; break;

    case 83: /*S*/
    case 40: /*down*/carControl.moveBackward = false; break;

    case 65: /*A*/
    case 37: /*left*/carControl.moveLeft = false; break;

    case 68: /*D*/
    case 39: /*right*/carControl.moveRight = false; break;
  }
};

window.addEventListener('keyup', function(event) { onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { onKeyDown(event); }, false);

