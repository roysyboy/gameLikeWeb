// Because JS is single-threaded, 2+ functions can't run at the same time

window.addEventListener("load", function (event) {

    // Cyclical Linked List Class Constructor:
    class Node {
      constructor(data, next = null) {
        this.data = data;
        this.next = next;
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
  
    // Image sources:
    playerImg = new Image();
    playerImg.src = 'bunny_final.png';
    bgImage = new Image();
    bgImage.src = 'map_test.gif'
  
    const CANV2PLAYERSCALE = 2.5;
    const PLAYER2BGSCALE = 2;
    const CANV2BGSCALE = CANV2PLAYERSCALE * PLAYER2BGSCALE;
  
    const BORDERWIDTH = 30;
  
    var player = {
      xOnCanv: 0,
      yOnCanv: 0,
      xOnMap: 0,
      yOnMap: 0,
      initXOnMap: 0,
      initYOnMap: 0,
      width: 32 * CANV2PLAYERSCALE,
      height: 32 * CANV2PLAYERSCALE,
      speed: 9
    }
  
    var canvasMax = {
      width: player.width * 8,
      height: player.height * 6
    }
  
    var center = {
      x: (canvas.width - player.width) / 2,
      y: (canvas.height - player.height) / 2
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
      xOnCanv: 0,
      yOnCanv: 0,
      xOnMap: 0,
      yOnMap: 0,
      toDest: false,
      onDown: false,
      e: null
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
    // var canvasPropo = 0.6;
  
    var map = {
      pixelWidth: 256,                // actual width in pixels
      pixelHeight: 192,               // actual height in pixels
      canvWidth: 256 * CANV2BGSCALE,  // in-game width
      canvHeight: 192 * CANV2BGSCALE, // in-game height
      segX: 0,                       // top-left x coord of the map segment
      segY: 0,                       // top-left y coord of the map segment
      xDest: 0,                       // x coord of player's dest set by mouse
      yDest: 0,                       // y coord of player's dest set by mouse
    };
  
    var curDirection = 'DOWN';
    var prevDirection = "DOWN";
    var stopHrzFlag = false;
    var stopVtcFlag = false;
    var ranNum = 0;
  
    var curCollision = null;
  
    moveArray.down = [
      3, 4, 3, 0, 5, 6, 5, 0];
    moveArray.up = [
      15, 16, 15, 14, 17, 18, 17, 14];
    moveArray.left = [
      10, 11, 10, 7, 12, 13, 12, 7];
    moveArray.right = [
      22, 23, 22, 19, 24, 25, 24, 19];
  
    function createStillActionArray(stillIndex) {
      // Do some still action stuff like blink, breathe, etc
      if (stillIndex == 14) {
        return [stillIndex];
      } else {
        var i, j;
        var finalArray = [];
        var still = [];
        for (i = 0; i < 4; i++) {
          still.push(stillIndex)
        }
        var blink = [
          stillIndex + 2, stillIndex + 2,
          stillIndex, stillIndex];
        var sniff = [
          stillIndex, stillIndex,
          stillIndex + 1, stillIndex + 1];
  
        finalArray.push.apply(finalArray, still);
        for (i = 0; i < 2; i++) {
          finalArray.push.apply(finalArray, sniff);
        }
        for (i = 0; i < 2; i++) {
          finalArray.push.apply(finalArray, still);
          finalArray.push.apply(finalArray, blink);
          finalArray.push.apply(finalArray, still);
        }
        return finalArray;
      }
    }
  
    stillArray.down = createStillActionArray(0);
    stillArray.up = createStillActionArray(14);
    stillArray.left = createStillActionArray(7);
    stillArray.right = createStillActionArray(19);
  
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
  
    var note = document.createElement("h1");
    // create player & background:
    function setup() {
      canvas = document.querySelector("#canvas");
      ctx = canvas.getContext('2d');
      resize();
    }
    setup();
  
  
    // re-size the canvas when re-sizing window:
    function resize(e) {
      if (window.innerWidth > canvasMax.width + BORDERWIDTH) {
        canvas.width = canvasMax.width;
      } else {
        canvas.width = window.innerWidth - BORDERWIDTH;
      }
      if (window.innerHeight > canvasMax.height + BORDERWIDTH) {
        canvas.height = canvasMax.height;
      } else {
        canvas.height = window.innerHeight - BORDERWIDTH;
      }
      centerPlayer();
      render();
    };
  
    function centerPlayer() {
      stopMove("a");
      mouse.toDest = false;
      // Try to set the player's position in the center of the map & canvas
      centerMapSeg();
      player.xOnCanv = (canvas.width - player.width) / 2;
      player.yOnCanv = (canvas.height - player.height) / 2;
      player.xOnMap = map.segX + canvas.width / 2 - player.width / 2;
      player.yOnMap = map.segY + canvas.height / 2 - player.height / 2;
    }
    function centerMapSeg() {
      map.segX = (map.canvWidth / 2 - canvas.width / 2);
      map.segY = (map.canvHeight / 2 - canvas.height / 2);
    }
  
    // actually render the player onto the canvas
    function render() { 
      // Draw Background:
      ctx.drawImage(bgImage,
        map.segX / CANV2BGSCALE, map.segY / CANV2BGSCALE,
        canvas.width / CANV2BGSCALE, canvas.height / CANV2BGSCALE,
        0, 0,
        canvas.width, canvas.height,
      );
  
      // Draw Player:
      ctx.drawImage(playerImg, // Image source
        sprite.curFrame * sprite.singleWidth, 0, // top left coord
        sprite.singleWidth, sprite.singleHeight, // width and height of pic
        player.xOnCanv, player.yOnCanv, // top left's pos on canvas
        player.width, player.height // size on canvas
      );
    }
    function bgImageXLT() {
      return (player.xOnCanv - (canvas.width - player.width) / 2) /
        playerScaleIndex;
    }
    function bgImageYLT() {
      return (player.yOnCanv - (canvas.height - player.height) / 2) /
        playerScaleIndex;
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
  
  
    //=>>>>>>>>>>>>>>>>>>>
    //=>>> MOVE FUNC >>>>>
    //=>>>>>>>>>>>>>>>>>>>
    function move() {
      prevDirection = curDirection;
      if (atEndOfMap()) {
        movePlayer();
      } else {
        shiftMap();
      }
      setCurDirection();
    }
    function atEndOfMap() {
      if ((map.segX < player.speed) && (LEFT || RIGHT)) {
        if (RIGHT && (player.xOnCanv + player.speed > (canvas.width - player.width) / 2)) {
          return false;
        }
        return true;
      } else if ((map.segX + canvas.width > (map.canvWidth - player.speed)) && (LEFT || RIGHT)) {
        if (LEFT && (player.xOnCanv - player.speed < (canvas.width - player.width) / 2)) {
          return false;
        }
        return true;
      } else if ((map.segY + canvas.height > (map.canvHeight - player.speed)) && (UP || DOWN)) {
        if (UP && (player.yOnCanv - player.speed < (canvas.height - player.height) / 2)) {
          return false;
        }
        return true;
      } else if ((map.segY < player.speed) && (UP || DOWN)) {
        if (DOWN && (player.yOnCanv + player.speed > (canvas.height - player.height) / 2)) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
    function shiftMap() {
      // shift the map accordingly
      if (LEFT) {
        map.segX -= player.speed;
        player.xOnMap -= player.speed;
      } else if (RIGHT) {
        map.segX += player.speed;
        player.xOnMap += player.speed;
      } else if (DOWN) {
        map.segY += player.speed;
        player.yOnMap += player.speed;
      } else if (UP) {
        map.segY -= player.speed;
        player.yOnMap -= player.speed;
      }
    }
    function movePlayer() {
      // move according to the key pressed or released
      if (LEFT) {
        if (canGoLeft()) { player.xOnCanv -= player.speed; }
        //console.log("move: LEFT")
      } else if (RIGHT) {
        if (canGoRight()) { player.xOnCanv += player.speed; }
        //console.log("move: RIGHT")
      } else if (DOWN) {
        //console.log("move: DOWN")
        if (canGoBottom()) { player.yOnCanv += player.speed; }
      } else if (UP) {
        //console.log("move: UP")
        if (canGoTop()) { player.yOnCanv -= player.speed; }
      }
      // shift the player among the map as well
      player.xOnMap = xOnMap(player.xOnCanv);
      player.yOnMap = yOnMap(player.yOnCanv);
    }
  
    function setCurDirection() {
      if (LEFT) { curDirection = 'LEFT'; }
      else if (RIGHT) { curDirection = 'RIGHT'; }
      else if (DOWN) { curDirection = 'DOWN'; }
      else if (UP) { curDirection = 'UP'; }
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
  
    var introAnimeSec = 0;
    var opacity = 0;
  
    function loopAlgorithm() {
      clearCanvas();
      if (atCollision()) {
        stopInterval();
        centerPlayer(curCollision);
        openTab();
      } else if (mouse.toDest) {
        moveToMouse(mouse.xOnMap, mouse.yOnMap);
      } else {
        setRandomNumber();
        move();
      }
      incrementFrame();
      render();
      introAnimation();
      // printBunnyInfo();
    }
  
    function introAnimation() {
      if (introAnimeSec < (2 * animation.fps)) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        opacity += 1 / (2 * animation.fps);
        ctx.globalAlpha = opacity;
        ctx.fillText("Welcome to V-World!", canvas.width / 2, canvas.height / 4);
        introAnimeSec += 1;
      } else if (introAnimeSec < (5 * animation.fps)) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Welcome to V-World!", canvas.width / 2, canvas.height / 4);
        introAnimeSec += 1;
      } else if (introAnimeSec < (6 * animation.fps)) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        opacity -= 1 / (1 * animation.fps);
        ctx.globalAlpha = opacity;
        ctx.fillText("Welcome to V-World!", canvas.width / 2, canvas.height / 4);
        introAnimeSec += 1;
      }
    }
  
    function stopInterval() {
      setTimeout(mainIntervalLoop, 10000);
    }
  
    function atCollision() {
      if (((player.xOnMap >= 492) && (player.xOnMap <= 708)) &&
        ((player.yOnMap <= 250) && player.yOnMap >= 34)) {
        curCollision = 'dream';
        return true;
      } else false;
    }
    // Opens a new webpage.
    function openTab() {
      switch (curCollision) {
        case 'dream':
          window.open("https://GameLikeWebsite.roypark1.repl.co/dream/tab1.html", "_self");
          break;
        default:
          console.log("unidentified tab");
      }
    }
  
    function canGoLeft() {
      // can it go left
      if (player.xOnCanv > player.speed) { return true; }
      else { return false; }
    }
    function canGoRight() {
      // can it go right
      if (player.xOnCanv < (canvas.width - player.width - player.speed)) {
        return true;
      } else { return false; }
    }
    function canGoBottom() {
      // can it go down
      if (player.yOnCanv < (canvas.height - player.height - player.speed)) {
        return true;
      } else { return false; }
    }
    function canGoTop() {
      // can it go up
      if (player.yOnCanv > player.speed) { return true; }
      else { return false; }
    }
  
    // the function that is going to be looped when using mouse-click
    function moveToMouse(xDest, yDest) {
      // move player to the coordinate of the mouse (x, y)
      if (objAtXMouse(xDest) && objAtYMouse(yDest)) {
        // console.log("option 1");
        stopMove("a");
        mouse.toDest = false; // obj sucessfully moved to destination
        // console.log("obj coord: " + player.xOnCanv+ ", " + player.y);
      } else if (!objAtXMouse(xDest) && !objAtYMouse(yDest)) {
        // console.log("option 4");
        stopMove("a");
        if (distanceOf(player.initXOnMap, xDest) >
          distanceOf(player.initYOnMap, yDest)) {
          // console.log(ranNum);
          if (playerHalfWay('x')) { // x > y
            howToMoveY(yDest);
          } else {
            howToMoveX(xDest);
          }
        } else {
          if (playerHalfWay('y')) { // y > x
            howToMoveX(xDest);
          } else {
            howToMoveY(yDest);
          }
        }
        move();
      } else if (objAtXMouse(xDest) && !objAtYMouse(yDest)) {
        // console.log("option 2");
        stopMove("h");
        howToMoveY(yDest);
        move();
      } else if (!objAtXMouse(xDest) && objAtYMouse(yDest)) {
        // console.log("option 3");
        stopMove("v");
        howToMoveX(xDest);
        move();
      }
    }
    // gives instruction of how to move x coord
    function howToMoveX(xDest) {
      if (((player.xOnMap + player.width / 2.0) > xDest) && canGoLeft()) {
        // if the xDest is on player's left and the player can go left
        // console.log("howToMove: left");
        LEFT = true;
        RIGHT = false;
      } else if ((xDest > (player.xOnMap + player.width / 2.0)) && canGoRight()) {
        // if the xDest is on player's right and the player can go right
        // console.log("howToMove: right");
        RIGHT = true;
        LEFT = false;
      } else {
        // can't move hrz-ly
        stopHrzFlag = true;
        stopMove("h");
      }
    }
    // gives instruction of how to move y coord
    function howToMoveY(yDest) {
      if (((player.yOnMap + player.height / 2.0) > yDest) && canGoTop()) {
        // move up
        // console.log("howToMove: up");
        UP = true;
        DOWN = false;
      } else if ((yDest > (player.yOnMap + player.height / 2.0)) && canGoBottom()) {
        // move down
        // console.log("howToMove: down");
        DOWN = true;
        UP = false;
      } else {
        // can't move vtc-ly
        stopVtcFlag = true;
        stopMove("v");
      }
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
      // This could be improved by also including the stillFrame count in the if statement
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
  
    function xOnMap(xOnCanv) {
      return xOnCanv + map.segX;
    }
    function yOnMap(yOnCanv) {
      return yOnCanv + map.segY;
    }
    function xOnCanv(xInput) {
      return xInput - (window.innerWidth - canvas.width) / 2;
    }
    function yOnCanv(yInput) {
      return yInput - (window.innerHeight - canvas.height) / 2;
    }
    // when touching the screen
    /* 
    document.ontouchstart = (e) => {
      mouse.toDest = true;
      console.log(`${mouse.xOnMap}, ${mouse.xOnMap}`);
      stopAllMove();
      mouse.xOnCanv = xOnCanv(e.touches[0].clientX);    // Get the x coord of mouse on window
      mouse.yOnCanv = yOnCanv(e.touches[0].clientY);    // Get the y coord of mouse on window
      mouse.xOnMap = xOnMap(mouse.xOnCanv);
      mouse.yOnMap = yOnMap(mouse.yOnCanv);
      player.initXOnMap = player.xOnMap;
      player.initYOnMap = player.yOnMap;
    }
    document.ontouchmove = (e) => {
      mouse.toDest = true;
      console.log(`${mouse.xOnMap}, ${mouse.xOnMap}`);
      stopAllMove();
      mouse.xOnCanv = xOnCanv(e.touches[0].clientX);    // Get the x coord of mouse on window
      mouse.yOnCanv = yOnCanv(e.touches[0].clientY);    // Get the y coord of mouse on window
      mouse.xOnMap = xOnMap(mouse.xOnCanv);
      mouse.yOnMap = yOnMap(mouse.yOnCanv);
      player.initXOnMap = player.xOnMap;
      player.initYOnMap = player.yOnMap;
    }
    */
    // when clicking mouse on the canvas
    document.onmousemove = (e) => {
      if (e.which == 1 || e.which == 3) {
        clickAction(e);
        // console.log(e.clientX + " / " + e.clientY);
        // mouse.onDown = true;
      }
    }
    document.onmousedown = (e) => {
      if (e.which == 1 || e.which == 3) {
        clickAction(e);
      }
    }
  
    function clickAction(e) {
      mouse.toDest = true;
      console.log(`${mouse.xOnMap}, ${mouse.xOnMap}`);
      stopMove("a");
      mouse.xOnCanv = xOnCanv(e.clientX);    // Get the x coord of mouse on window
      mouse.yOnCanv = yOnCanv(e.clientY);    // Get the y coord of mouse on window
      mouse.xOnMap = xOnMap(mouse.xOnCanv);
      mouse.yOnMap = yOnMap(mouse.yOnCanv);
      player.initXOnMap = player.xOnMap;
      player.initYOnMap = player.yOnMap;
    }
  
    ////Use MOUSEMOVE
    // function setMouseDest() {
    //   e = mouse.e;
    //   if (mouse.toDest) {
    //     // console.log(`${e.clientX}, ${e.clientY}`)
    //     console.log(`${mouse.xOnMap}, ${mouse.xOnMap}`)
    //     stopAllMove();
    //     mouse.xOnCanv = xOnCanv(e.clientX);    // Get the x coord of mouse on window
    //     mouse.yOnCanv = yOnCanv(e.clientY);    // Get the y coord of mouse on window
    //     mouse.xOnMap = xOnMap(mouse.xOnCanv);
    //     mouse.yOnMap = yOnMap(mouse.yOnCanv);
    //     player.initXOnMap = player.xOnMap;
    //     player.initYOnMap = player.yOnMap;
    //   }
    // }
    // function setMouseDest() {
    // }
  
    /* 
    function click(e) {
      mouse.xOnCanv = xOnCanv(e.clientX);    // Get the x coord of mouse on window
      mouse.yOnCanv = yOnCanv(e.clientY);    // Get the y coord of mouse on window
      mouse.xOnMap = xOnMap(mouse.xOnCanv);
      mouse.yOnMap = yOnMap(mouse.yOnCanv);
      player.initXOnMap = player.xOnMap;
      player.initYOnMap = player.yOnMap;
      mouse.toDest = true;
      setRandomNumber();
      stopAllMove();
      // console.log("canvas coord: " +mouse.x + ", " + mouse.y);
      // console.log(`actual coord: ${e.clientX}, ${e.clientY}`);
    };
    */
  
  
    function setRandomNumber() {
      ranNum = Math.floor(Math.random() * 2);
    }
    function playerHalfWay(caseVal) {
      if ((caseVal == 'x') &&
        (distanceOf(player.xOnMap, mouse.xOnMap) <=
          distanceOf(player.initXOnMap, mouse.xOnMap) / 2)) {
        return true
      } else if ((caseVal == 'y') &&
        (distanceOf(player.yOnMap, mouse.yOnMap) <=
          distanceOf(player.initYOnMap, mouse.yOnMap) / 2)) {
        return true;
      } else {
        // console.log("ERROR IN playerHalfWay")
        return false;
      }
    }
    function distanceOf(p1, p2) {
      return Math.abs(p1 - p2);
    }
  
    // window.addEventListener("mousedown", click);
    window.addEventListener("resize", resize);
  
    function objAtXMouse(xDest) {
      if (stopHrzFlag ||
        ((Math.abs(player.xOnMap + player.width / 2 - xDest)) <= (player.speed))) {
        // console.log("obj atmouse.x");
        return true;
      } else {
        return false;
      }
    }
    function objAtYMouse(yDest) {
      if (stopVtcFlag ||
        ((Math.abs(player.yOnMap + player.height / 2 - yDest)) <= (player.speed))) {
        return true;
      } else {
        return false;
      }
    }
  
    function resetStopFlag() {
      stopHrzFlag = false; // reset the flags
      stopVtcFlag = false;
    }
    function stopMove(id) {
        switch(id) {
            case "h":
                LEFT , RIGHT = false;
                break;
            case "v":
                UP, DOWN = false;
                break;
            case "a":
                LEFT , RIGHT, UP, DOWN = false;//
                break;
            default:
                console.log("error in stopMove: id unidentified");
        }
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
  
    function printBunnyInfo() {
      console.log(`player.xOnCanv = ${player.xOnCanv}, player.yOnCanv = ${player.yOnCanv}`);
      console.log(`player.xOnMap = ${player.xOnMap}, player.yOnMap = ${player.yOnMap}`);
    }
  });
  
