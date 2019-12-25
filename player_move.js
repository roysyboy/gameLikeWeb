
// Because JS is single-threaded, 2+ functions can't run at the same time
// piskelapp.com is the pixel art-making website

window.addEventListener("load", function (event) {

  // Cycle Linked List Class:
  class Node {
    constructor(data, next = null) {
      this.data = data;
      this.next = next;
      this.selected = false;
      this.last = true;
    }
  }
  class CycleLinkedList {
    constructor() {
      this.head = null;
    }
    add(data) {
      var newNode = new Node(data);
      if (this.head == null) {
        this.head = newNode;
        this.head.next = this.head;
        this.head.selected = true;
        // console.log(this.head.data);
      } else {
        var current = this.head;
        while (!current.last) {
          current = current.next; //get to the end
        }
        current.next = newNode;
        current.last = false;
        current = current.next;
        current.next = this.head;
      }
    }
    returnNext(curNode) {
      if (curNode == null) {
        if (this.head == null) {
          console.log("no Node");
          return null;
        } else {
          return this.head;
        }
      } else if (curNode instanceof Node) {
        // console.log("type of param is Node");
        var tempNode = this.head;
        while (true) {
          if (tempNode == curNode) {
            return curNode.next;
          } else if (tempNode.last) {
            // console.log("can't find the node here");
            return null;
          } else {
            tempNode = tempNode.next;
          }
        }
      } else {
        console.log("returnNext returned null");
        return null;
      }
    }
  }

  var canvas = document.querySelector("#canvas");
  var ctx = canvas.getContext('2d');

  playerImg = new Image();
  playerImg.src = 'bunny_final.png';
  var player = {
    x: 0,
    y: 0,
    width: 32 * 2.5,
    height: 32 * 2.5,
    speed: 8
  }

  var sprite = {
    totalFrame: 26,
    curFrame: 0,
    totalWidth: 32 * 26,
    totalHeight: 32,
    singleWidth: 32,
    singleHeight: 32,
    framesPerLoop: 2
  }

  var moveArray = {
    down: [],
    up: [],
    left: [],
    right: []
  }
  var stillArray = {
    down: [],
    up: [],
    left: [],
    right: []
  }
  var moveLinkedList = {
    down: new CycleLinkedList(),
    up: new CycleLinkedList(),
    left: new CycleLinkedList(),
    right: new CycleLinkedList()
  }
  var stillLinkedList = {
    down: new CycleLinkedList(),
    up: new CycleLinkedList(),
    left: new CycleLinkedList(),
    right: new CycleLinkedList()
  }

  var LEFT = false;
  var RIGHT = false;
  var UP = false;
  var DOWN = false;

  var mouse = {
    x: 0,
    y: 0,
    toDest: false
    //var isAtDest = true
  }

  var animation = {
    fps: 26,
    stillFrameCount: 1,
    stillPosition: true
  }

  var stillPositionIndices = [
    0, 1, 2, 7, 8, 9, 14, 19, 20, 21
  ];
  var canvasPropo = 0.6;
  var curDirection = 'DOWN';
  var prevDirection = "DOWN";
  var stopHrzFlag = false;
  var stopVtcFlag = false;

  moveArray.down = [
    3, 4, 3, 0, 5, 6, 5, 0];
  moveArray.up = [
    15, 16, 15, 14, 17, 18, 17, 14];
  moveArray.left = [
    10, 11, 10, 7, 12, 13, 12, 7];
  moveArray.right = [
    22, 23, 22, 19, 24, 25, 24, 19];

  stillArray.down = [
    0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 1, 1, 0, 0, 0, 0,
    2, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 2, 0, 0];
  stillArray.up = [14];
  stillArray.left = [
    7, 7, 7, 7, 7, 7, 8, 8,
    7, 7, 8, 8, 7, 7, 7, 7,
    9, 9, 7, 7, 7, 7, 7, 7, 
    7, 7, 7, 7, 9, 9, 7, 7,];
  stillArray.right = [
    19, 19, 19, 19, 19, 19, 20, 20,
    19, 19, 20, 20, 19, 19, 19, 19,
    21, 21, 19, 19, 19, 19, 19, 19,
    19, 19, 19, 19, 21, 21, 19, 19];

  stillLinkedList.down = new CycleLinkedList();
  for (let val of stillArray.down) {
    stillLinkedList.down.add(val);
  }
  stillLinkedList.up = new CycleLinkedList();
  for (let val of stillArray.up) {
    stillLinkedList.up.add(val);
  }
  stillLinkedList.left = new CycleLinkedList();
  for (let val of stillArray.left) {
    stillLinkedList.left.add(val);
  }
  stillLinkedList.right = new CycleLinkedList();
  for (let val of stillArray.right) {
    stillLinkedList.right.add(val);
  }

  moveLinkedList.down = new CycleLinkedList();
  for (let val of moveArray.down) {
    moveLinkedList.down.add(val);
  }
  moveLinkedList.up = new CycleLinkedList();
  for (let val of moveArray.up) {
    moveLinkedList.up.add(val);
  }
  moveLinkedList.left = new CycleLinkedList();
  for (let val of moveArray.left) {
    moveLinkedList.left.add(val);
  }
  moveLinkedList.right = new CycleLinkedList();
  for (let val of moveArray.right) {
    moveLinkedList.right.add(val);
  }


  // create player:
  function setup() {
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext('2d');
    ctx.canvas.width = window.innerWidth * 2 / 3;
    ctx.canvas.height = window.innerHeight * 2 / 3;
    render();
  }
  setup();

  // resize the canvas depending on the resized-window
  function resize(e) {
    ctx.canvas.width = window.innerWidth * canvasPropo;
    ctx.canvas.height = window.innerHeight * canvasPropo;
    render();
  };

  // actually render the player onto the canvas
  function render() {
    /*
    img.src = 'sprite_sample_image.gif';
    ctx.drawImage(img, player.x, player.y, player.width, player.height);
    */
    //https://www.w3schools.com/tags/canvas_drawimage.asp
    ctx.drawImage(playerImg,
      sprite.curFrame * sprite.singleWidth, 0, // top left coord
      sprite.singleWidth, sprite.singleHeight, // bottom right coord
      player.x, player.y, // top left's pos on canvas
      player.width, player.height // size on canvas
    );
  }

  // move to direction of the key pressed down
  document.onkeydown = function (e) {
    mouse.toDest = false;
    resetStopFlag();
    if (e.keyCode == 37) {
      LEFT = true; // LEFT KEY
      RIGHT = false;
      UP = false;
      DOWN = false;
      // curDirection = 'LEFT';
    } else if (e.keyCode == 39) {
      RIGHT = true; // RIGHT KEY
      LEFT = false;
      UP = false;
      DOWN = false;
      // curDirection = 'RIGHT';
    } else if (e.keyCode == 38) {
      UP = true; // UP KEY
      LEFT = false;
      RIGHT = false;
      DOWN = false;
      // curDirection = 'UP';
    } else if (e.keyCode == 40) {
      DOWN = true; // DOWN KEY
      LEFT = false;
      RIGHT = false;
      UP = false;
      // curDirection = 'DOWN';
    }
    /*
    else if (e.keyCode == 32) {  // SPACEBAR
      clearInterval(mainIntervalLoop);
    }
    */
  };

  // stop when releasing previously pressed key
  document.onkeyup = function (e) {
    if (e.keyCode == 37) {
      LEFT = false; // left
    } else if (e.keyCode == 39) {
      RIGHT = false; // right
    } else if (e.keyCode == 38) {
      UP = false; // down
    } else if (e.keyCode == 40) {
      DOWN = false; // up
    }
  };

  // move according to the key pressed or released
  function move() {
    prevDirection = curDirection;
    if (LEFT) {
      curDirection = 'LEFT';
      if (canGoLeft()) { player.x -= player.speed; }
      //console.log("move: LEFT")
    } else if (RIGHT) {
      curDirection = 'RIGHT';
      if (canGoRight()) { player.x += player.speed; }
      //console.log("move: RIGHT")
    } else if (DOWN) {
      curDirection = 'DOWN';
      //console.log("move: DOWN")
      if (canGoBottom()) { player.y += player.speed; }
    } else if (UP) {
      curDirection = 'UP';
      //console.log("move: UP")
      if (canGoTop()) { player.y -= player.speed; }
    } else {
      // player stops moving
    }
  }

  // clears the canvas so that the moved object can be displayed
  function clearCanvas() {
    canvas.width = canvas.width;
  }

  ////////////////////////////////
  ///  THE MAIN INTERVAL LOOP  ///
  ////////////////////////////////
  var mainIntervalLoop = setInterval(loopAlgorithm, 1000 / animation.fps); // allows for movement 
  // This algorithm is constantly looping
  function loopAlgorithm() {
    if (mouse.toDest) {
      moveToMouse(mouse.x, mouse.y);
    } else {
      move();
    }
    clearCanvas();
    incrementFrame();
    render();
  }

  var prevMovingFlag = false;
  var curMovingFlag = false;
  function incrementFrame() {
    // If moving to a different location
    prevMovingFlag = curMovingFlag;
    if (moving()) {
      if (velocityChange() &&
      animation.stillFrameCount < sprite.framesPerLoop) {
        // repeat the same frame
        animation.stillFrameCount += 1;
      }
      curMovingFlag = true;
      movingAction();
      //https://opengameart.org/content/bunny-rabbit-lpc-style-for-pixelfarm
    } else if (!checkStillPosition()) {
      curMovingFlag = true;
      moveToStill();
    } else {
      curMovingFlag = false;
      if (velocityChange() &&
      animation.stillFrameCount < sprite.framesPerLoop) {
        // repeat the same frame
        animation.stillFrameCount += 1;
      }
      stillAction();
      //console.log("still action")
    }
  }

  var moveLinkedListToUse = moveLinkedList.down;
  var curNode = null;
  function movingAction() {
    if (directionChange() || velocityChange()) {
      if (LEFT) {
        moveLinkedListToUse = moveLinkedList.left;
        curNode = null;
      } else if (RIGHT) {
        moveLinkedListToUse = moveLinkedList.right;
        curNode = null;
      } else if (UP) {
        moveLinkedListToUse = moveLinkedList.up;
        curNode = null;
      } else if (DOWN) {
        moveLinkedListToUse = moveLinkedList.down;
        curNode = null;
      }
    }
    curNode = animateNextFrame(moveLinkedListToUse, curNode);
  }
  function animateNextFrame(linkedList, node) {
    if (animation.stillFrameCount < sprite.framesPerLoop) {
      // repeat the same frame
      animation.stillFrameCount += 1;
      return node;
    } else {
      animation.stillFrameCount = 1; // reset still Frame Count
      // switch to the next frame
      node = linkedList.returnNext(node);
      sprite.curFrame = node.data;
      return node;
    }
  }
  function checkStillPosition() {
    if (stillPositionIndices.includes(sprite.curFrame)) {
      // if the player is in its still frame
      return true;
    } else {
      return false;
    }
  }
  function moving() {
    if (LEFT || RIGHT || UP || DOWN) {
      return true;
    } else {
      return false;
    }
  }
  function moveToStill() {
    curNode = animateNextFrame(moveLinkedListToUse, curNode);
  }
  var stillNode = null;
  var stillLinkedListToUse = stillLinkedList.down;
  function stillAction() {
    if (velocityChange()) {
      if (curDirection == 'LEFT') {
        stillLinkedListToUse = stillLinkedList.left;
        stillNode = null;
      } else if (curDirection == 'RIGHT') {
        stillLinkedListToUse = stillLinkedList.right;
        stillNode = null;
      } else if (curDirection == 'UP') {
        stillLinkedListToUse = stillLinkedList.up;
        stillNode = null;
      } else if (curDirection == 'DOWN') {
        stillLinkedListToUse = stillLinkedList.down;
        stillNode = null;
      }
    }
    stillNode = animateNextFrame(stillLinkedListToUse, stillNode);
  }
  function directionChange() {
    if (prevDirection != curDirection) {
      return true;
    } else {
      return false;
    }
  }
  function velocityChange() {
    if (prevMovingFlag != curMovingFlag) {
      return true;
    } else {
      return false;
    }
  }


  function canGoLeft() {
    // can it go left
    if (player.x > player.speed) { return true; }
    else { return false; }
  }
  function canGoRight() {
    // can it go right
    if (player.x < (ctx.canvas.width - player.width - player.speed)) {
      return true;
    } else { return false; }
  }
  function canGoBottom() {
    // can it go down
    if (player.y < (ctx.canvas.height - player.height - player.speed)) {
      return true;
    } else { return false; }
  }
  function canGoTop() {
    // can it go up
    if (player.y > player.speed) { return true; }
    else { return false; }
  }

  // gives instruction of how to move x coord
  function howToMoveX(xMouse) {
    if (((player.x + player.width / 2) > xMouse) && canGoLeft()) {
      // move left
      // console.log("howToMove: left");
      LEFT = true;
      RIGHT = false;
    } else if ((xMouse > (player.x + player.width / 2)) && canGoRight()) {
      // move right
      // console.log("howToMove: right");
      RIGHT = true;
      LEFT = false;
    } else {
      // can't move hrz-ly
      stopHrzFlag = true;
      stopHrzMove();
    }
  }
  // gives instruction of how to move y coord
  function howToMoveY(yMouse) {
    if (((player.y + player.height / 2) > yMouse) && canGoTop()) {
      // move up
      // console.log("howToMove: up");
      UP = true;
      DOWN = false;
    } else if ((yMouse > (player.y + player.height / 2)) && canGoBottom()) {
      // move down
      // console.log("howToMove: down");
      DOWN = true;
      UP = false;
    } else {
      // can't move vtc-ly
      stopVtcFlag = true;
      stopVtcMove();
    }
  }

  // the function that is going to be looped when using mouse-click
  function moveToMouse(x, y) {
    // move player to the coordinate of the mouse (x, y)
    // console.log("moveToMouse Start!")
    if (objAtXMouse(x) && objAtYMouse(y)) {
      // console.log("option 1");
      stopAllMove();
      mouse.toDest = false; // obj sucessfully moved to destination
      // console.log("obj coord: " + player.x + ", " + player.y);
    } else if (objAtXMouse(x) && !objAtYMouse(y)) {
      // console.log("option 2");
      stopHrzMove();
      howToMoveY(y);
      move();
    } else if (!objAtXMouse(x) && objAtYMouse(y)) {
      // console.log("option 3");
      stopVtcMove();
      howToMoveX(x);
      move();
    } else if (!objAtXMouse(x) && !objAtYMouse(y)) {
      // console.log("option 4");
      howToMoveX(x);
      move();
    }
  }

  function xOnCanv(xInput) {
    return xInput - (window.innerWidth * (1 - canvasPropo) / 2);
  }
  function yOnCanv(yInput) {
    return yInput - (window.innerHeight * (1 - canvasPropo) / 2);
  }
  // when clicking mouse on the canvas
  function click(e) {
    mouse.x = xOnCanv(e.clientX);    // Get the x coordinate
    mouse.y = yOnCanv(e.clientY);    // Get the y coordinate
    mouse.toDest = true;
    stopAllMove();
    // console.log("canvas coord: " +mouse.x + ", " + mouse.y);
    // console.log(`actual coord: ${e.clientX}, ${e.clientY}`);
  };

  window.addEventListener("click", click);
  window.addEventListener("resize", resize);

  resize();

  function objAtXMouse(x) {
    if (stopHrzFlag ||
      ((Math.abs(player.x + player.width / 2 - x)) <= (player.speed + 1))) {
      // console.log("obj atmouse.x");
      return true;
    } else {
      // console.log("obj not atmouse.x");
      return false;
    }
  }
  function objAtYMouse(y) {
    if (stopVtcFlag ||
      ((Math.abs(player.y + player.height / 2 - y)) <= (player.speed + 1))) {
      // console.log("obj at mouse.y");
      return true;
    } else {
      // console.log("obj not at mouse.y");
      return false;
    }
  }


  function resetStopFlag() {
    stopHrzFlag = false; // reset the flags
    stopVtcFlag = false;
  }

  function stopHrzMove() {
    LEFT = false;
    RIGHT = false;
  }
  function stopVtcMove() {
    UP = false;
    DOWN = false;
  }
  function stopAllMove() {
    stopHrzMove();
    stopVtcMove();
    resetStopFlag();
  }
});





  /*
  SOME PAST CODES THAT COULD POTENTIALLY BE USED LATER:

  var moveLinkedListToUse = moveLinkedList.down;
  var moveCurNode = null;
  function movingAction() {
    if (LEFT && directionChange()) {
      moveLinkedListToUse = moveLinkedList.left;
      moveCurNode = null;
    } else if (RIGHT && directionChange()) {
      moveLinkedListToUse = moveLinkedList.right;
      moveCurNode = null;
    } else if (UP && directionChange()) {
      moveLinkedListToUse = moveLinkedList.up;
      moveCurNode = null;
    } else if (DOWN && directionChange()) {
      moveLinkedListToUse = moveLinkedList.down;
      moveCurNode = null;
    }
    animateNextFrame(moveLinkedListToUse, curNode);
  }











  stillArray.down = createStillAction(0);
  stillArray.up = createStillAction(14);
  stillArray.left = createStillAction(7);
  stillArray.right = createStillAction(7);
  moveArray.down = createMoveAction(0, 3);
  moveArray.up = createMoveAction(14, 15);
  moveArray.left = createMoveAction(7, 10);
  moveArray.right = createMoveAction(7, 10);


  function createStillAction(stillIndex) {
    // Do some still action stuff like blink, breathe, etc
    var stillOrder = [];
    var i, j;
    for (i = 1; i <= 2; i++) {
      for (j = 0; j <= i; j += i) {
        stillOrder.push(stillOrder + j);
        stillOrder.push(stillOrder + j);
      }
      stillOrder.push(stillOrder);
      stillOrder.push(stillOrder);
    }
    return stillOrder;
  }
  function createMoveAction(stillIndex, moveIndex) {
    var moveOrder = [];
    var i;
    for (i = 0; i <= 2; i += 2) {
      moveOrder.push(stillIndex);
      moveOrder.push(moveIndex + i);
      moveOrder.push(moveIndex + i + 1);
      moveOrder.push(moveIndex + i);
    }
    return moveOrder;
  }




  function loopAlgorithm() {
    if (isKeyPressed) {
      mouse.toDest = false; // doesn't set destination to mouse anymore
      moveKeyboard();
    }
    else if (mouse.toDest && !isAtDest) {
      moveToMouse(xMouse, mouse.y);
    }
    clearCanvas();
    render();
  }
  */

  /* moveToMouse Algorithm
  Just in case I need it
      if ( (objAtXMouse(x) && objAtYMouse(y)) ||
        (!canGoFurtherHrz() && !canGoFurtherVtc()) ) {
        console.log("option 1");
        stopAllMove();
        isAtDest = true; // obj sucessfully moved to destination
        console.log("obj coord: " + player.x + ", " +  player.y);
      } else if ( (objAtXMouse(x) && !objAtYMouse(y)) || 
      (!canGoFurtherHrz() && canGoFurtherVtc())) {
        console.log("option 2");
        stopHrzMove();
        howToMoveY(y);
        move();
      } else if ( (!objAtXMouse(x) && objAtYMouse(y)) || 
      (canGoFurtherHrz() && !canGoFurtherVtc())) {
        console.log("option 3");
        stopVtcMove();
        howToMoveX(x);
        move();
      } else if ( (!objAtXMouse(x) && !objAtYMouse(y)) && 
      (canGoFurtherHrz() && canGoFurtherVtc())) {
        console.log("option 4");
        howToMoveX(x);
        move();
      }
      
     */
