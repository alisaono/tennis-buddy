// Hand it in this way: for simpler testing, always use the same seed.
Math.seedrandom(0);

// constants
const DEFAULT_BOARD_SIZE = 8;
// set size from URL or to default
const size = Math.min(10, 
                      Math.max(3, 
                               parseInt(Util.getURLParam("size")) || 
                               DEFAULT_BOARD_SIZE));

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};

// data model at global scope for easier debugging
// initialize board model
var board = new Board(size);

// load a rule
var rules = new Rules(board);

// State to indicate whether a new game is pending (this is in part to 
// prevent getRandomValidMove from being called, which messes up the
// random seeding, and also to speed up new game generation by not
// having the buttons lookahead at every board operation).
var pendingNewGame = true;

// Attaching events on document because then we can do it without waiting for
// the DOM to be ready (i.e. before DOMContentLoaded fires)
Util.events(document, {
	// Final initalization entry point: the Javascript code inside this block
	// runs at the end of start-up when the DOM is ready
	"DOMContentLoaded": function() {
    // Names of directions passable to board instances
    boardDirections = ["up", "down", "left", "right"];
    
    // Generate alphabetic labels for columns
    colLabels = Array(size).fill().map((_, i) => 
      String.fromCharCode(i+"a".charCodeAt(0)))
  
		// Element refs
    dom.score = Util.one("#score");
    dom.scoreBox = Util.one("#score-box");
    dom.newGame = Util.one("#new-game");
    dom.gameGrid = Util.one("#game-grid");

    // Indicate that new game generation has begun
    pendingNewGame = true;
    
    // State to indicate whether a crush is pending (i.e. crushes have been 
    // removed, but candies haven't been moved down).
    let pendingCrush = false;
    
    // State to indicate the current hint timeout, so that it may be cancelled
    // if needed.
    let hintTimeoutID = null;
    
    // State to indicate the current dragged square/candy, if any.
    let baseMouseX = null;
    let baseMouseY = null;
    let mouseSquare = null;
    
    // Let grid know size
    Util.css(dom.gameGrid, {
      "--size": size
    });
    
    // Due to Firefox bug where you can't use var/calc inside repeat, need to
    // manually set it with JS.
    Util.css(dom.gameGrid, {
      "grid-template-columns": "repeat(" + (size+1) + ", var(--cell))",
      "grid-template-rows": "repeat(" + (size+1) + ", var(--cell))"
    })
    
    // Create game grid
    let getGridArea = (r, c) => 
        (r+1) + "/" + (c+1) + "/" + (r+2) + "/" + (c+2); 
    dom.gameSquares = Array(size).fill().map(() => Array(size).fill());
    dom.gameCandies = Array(size).fill().map(() => Array(size).fill());
    for (row = 0; row < size+1; row++) {
      for (col = 0; col < size+1; col++) {
        if (row == 0) {
          if (col > 0) {
            let sq = Util.create("div", {
              "class": "game-square label-square"
            });
            Util.css(sq, {
              "grid-area": getGridArea(row, col)
            });
            
            sq.textContent = colLabels[col-1];
            dom.gameGrid.appendChild(sq);
          }
        } else if (col == 0) {
          if (row > 0) {
            let sq = Util.create("div", {
              "class": "game-square label-square"
            });
            Util.css(sq, {
              "grid-area": getGridArea(row, col)
            });
            
            sq.textContent = row;
            dom.gameGrid.appendChild(sq);
          }
        } else {
            let sq = Util.create("div", {
              "class": "game-square candy-square"
            });
            Util.css(sq, {
              "grid-area": getGridArea(row, col)
            });
            
            let img = Util.create("img", {
              "class": "candy"
            });
            img.classList.add("hidden");
            
            sq.appendChild(img);
            dom.gameGrid.appendChild(sq);

            dom.gameSquares[row-1][col-1] = sq;
            dom.gameCandies[row-1][col-1] = img;
            
            img.ondragstart = () => {return false;};
        }
      }
    }
    dom.flattenedCandies = [].concat(...dom.gameCandies);
    
    // Check whether any animations are pending
    function pendingAnimation() {
      return (Util.one("img.candy.fade,img.candy.move") !== null)
    }
    
    // Force finish any pending animations
    function finishAnimation() {
      Util.all("img.candy.fade").forEach((img) => {
        img.dispatchEvent(new AnimationEvent("animationend", {
          "animationName": "anim-fade"
        }));
      });

      Util.all("img.candy.move").forEach((img) => {
        img.dispatchEvent(new AnimationEvent("animationend", {
          "animationName": "anim-move"
        }));
      });
    }
    
    // Helper functions for starting/stopping pulsation.
    function startPulse(candies) {
      Util.delay(0).then(() => {
        candies.forEach(function(c) {
          let img = dom.gameCandies[c.row][c.col];
          img.classList.add("pulse");
        });
      });
    }
    function stopPulse() {
      Util.all("img.candy.pulse").forEach(function (i) {
        i.classList.remove("pulse");
      });
    }
    
    // Start countdown towards showing a hint.
    function startHint() {
      clearTimeout(hintTimeoutID);
      hintTimeoutID = setTimeout(() => {
        if (!pendingCrush && !pendingNewGame) {
          stopPulse();
          let randomMove = rules.getRandomValidMove();
          if (randomMove !== null) {
            let candies = rules.getCandiesToCrushGivenMove(
              randomMove.candy, 
              randomMove.direction);
            startPulse(candies);
          }
        }
      }, 5000);
    }
    
    // Clear any hint countdowns.
    function stopHint() {
      clearTimeout(hintTimeoutID);
      hintTimeoutID = null;
    }
    
    // Reset UI state
    function resetUI() {
      // Force any pending animations to finish
      finishAnimation();
      stopHint();
      stopPulse();
      
      // Reset score box
      dom.score.innerHTML = 0;
      Util.css(dom.scoreBox, {
        "color": "",
        "background-color": ""
      });
      
      // Reset state
      pendingCrush = false;
      hintTimeoutID = null;
      mouseSquare = null;
    }
    
    // Input text and disabled state persist across page reloads, so reset
    // manually
    resetUI();
    
		// Add event listener for new game button
    dom.newGame.addEventListener("click", (e) => {      
      // Indicate that new game generation has begun
      pendingNewGame = true;
      
      // Reset UI state
      resetUI();
      
      // Populate board
      rules.prepareNewGame();
      
      // Indicate that new game generation has finished
      pendingNewGame = false;
      
      // Start hint countdown
      startHint();
    });
    
    // Crush all available crushes repeatedly until none are left.
    function crushAll() {
      // Force any pending animations to finish
      finishAnimation();
      stopHint();
      stopPulse();
      
      // Indicate that crush operation has started.
      pendingCrush = true;
      
      // Recurse until all crushes are complete.
      crushAllRecursive();
    }
    function crushAllRecursive() {
      let crushable = rules.getCandyCrushes();
      if (!pendingNewGame && crushable.length > 0) {
        rules.removeCrushes(crushable);

        Util.afterAnimation(dom.flattenedCandies, "anim-fade").then(() => {
            if (!pendingNewGame) {
              rules.moveCandiesDown();
           
              Util.afterAnimation(dom.flattenedCandies, "anim-move").then(() => {
                if (!pendingNewGame) {
                  crushAllRecursive();
                }
              });
            }
        });
      } else {
        // Indicate that crush operation has finished.
        pendingCrush = false;
        
        startHint();
      }
    };
    
    // Determine which square a mouse is located in, if any.
    function getMouseSquare(mouseX, mouseY) {
      let topLeftBounding = Util.offset(dom.gameSquares[0][0]);
      let cellDist = dom.gameSquares[1][0].getBoundingClientRect().top - 
                     dom.gameSquares[0][0].getBoundingClientRect().top;
                     
      let relativeX = mouseX - topLeftBounding.left;
      let relativeY = mouseY - topLeftBounding.top;
      if (relativeX < 0 || relativeX >= size * cellDist ||
          relativeY < 0 || relativeY >= size * cellDist) {
            return null;
      } else {
        return {
          "row": Math.floor(relativeY / cellDist),
          "col": Math.floor(relativeX / cellDist)
        }
      }
    }
    
    // Add event listener for mousedown events.
    document.addEventListener("mousedown", (e) => {
      if (!pendingNewGame) {
        // If (somehow) a candy was still being dragged, reset it to ensure sane
        // behavior. Shouldn't really happen.
        if (mouseSquare !== null) {
          let img = dom.gameCandies[mouseSquare.row][mouseSquare.col];
          
          Util.css(img, {
            "z-index": "",
            "top": "",
            "left": ""
          });
          
          mouseSquare = null;
        }
        
        // Get position of mouse down
        baseMouseX = e.clientX;
        baseMouseY = e.clientY;        
        
        // Get square the mouse is in
        let newMouseSquare = getMouseSquare(baseMouseX, baseMouseY);
        
        // Check whether a square was clicked
        if (newMouseSquare !== null && !pendingCrush && !pendingNewGame) {
          // Force any pending animations to finish
          finishAnimation();
          stopHint();
          stopPulse();
          
          // Indicate that square is being dragged.
          mouseSquare = newMouseSquare;
        }
      }
    });
    
    // Add event listener for mousemove events.
    document.addEventListener("mousemove", (e) => {
      // Check if candy is being dragged.
      if (mouseSquare !== null) {
        let img = dom.gameCandies[mouseSquare.row][mouseSquare.col];
        
        // Compute candy's new position.
        candyX = e.clientX - baseMouseX;
        candyY = e.clientY - baseMouseY;
        
        // Set candy to position of mouse.
        Util.css(img, {
          "z-index": 1,
          "top": candyY + "px",
          "left": candyX + "px"
        });
      }
    });
    
    // Helper function for checking if a mouse operation is valid.
    function isMouseValid(fromMouseSquare, toMouseSquare) {
      if (fromMouseSquare === null || toMouseSquare === null) {
        return false;
      }
      
      // Check for all 4 move directions
      let fromCandy = board.getCandyAt(fromMouseSquare.row, fromMouseSquare.col);
      for (let d of boardDirections) {
        // Ensure the direction is valid before fetching candy
        if (rules.isMoveTypeValid(fromCandy, d)) {
          // Fetch the actual candy in direction
          let toCandy = board.getCandyInDirection(fromCandy, d);
          
          // Check whether destination candy is the actual destination
          if (toMouseSquare.row == toCandy.row &&
              toMouseSquare.col == toCandy.col) {
            return true;
          }
        }
      }
      
      return false;
    }
    
    // Add event listener for mouseup events.
    document.addEventListener("mouseup", (e) => {
      // Check if candy is being dragged.
      if (mouseSquare !== null) {
        let img = dom.gameCandies[mouseSquare.row][mouseSquare.col];
        
        // Get the new square the mouse is in
        let newMouseSquare = getMouseSquare(e.clientX, e.clientY);
        
        // Check if the square is a valid move
        if (isMouseValid(mouseSquare, newMouseSquare)) {          
          // Swap the candies
          let fromCandy = board.getCandyAt(mouseSquare.row, mouseSquare.col);
          let toCandy = board.getCandyAt(newMouseSquare.row, newMouseSquare.col);
          board.flipCandies(fromCandy, toCandy);
          
          // Indicate that a crush is imminent
          pendingCrush = true;
          
          // Crush the candies after swap is complete
          Util.afterAnimation(dom.flattenedCandies, "anim-move").then(() => {
            if (!pendingNewGame) {
              crushAll();
            }
          });
          
        } else {
          let detail = {
				    candy: board.getCandyAt(mouseSquare.row, mouseSquare.col),
				    toRow: mouseSquare.row,
				    toCol: mouseSquare.col,
				    fromRow: mouseSquare.row,
				    fromCol: mouseSquare.col
          };
        
          // Move candy back to original location
          board.dispatchEvent(new CustomEvent("move", {detail}));
          
          // Start hint countdown after candy returns
          Util.afterAnimation(dom.flattenedCandies, "anim-move").then(() => {
            if (!pendingNewGame) {
              startHint();
            }
          });          
        }
        
        // Indicate that candy is no longer being dragged.
        mouseSquare = null;
      }
    });
    
    // Add event listener for when mouse leaves window.
    document.addEventListener("mouseout", (e) => {
      // Check if mouseout event is for window
      e = e ? e : window.event;
      let fromNode = e.relatedTarget || e.toElement;
      if (!fromNode || fromNode.nodeName == "HTML") {
        // Check if candy is being dragged.
        if (mouseSquare !== null) {
          let img = dom.gameCandies[mouseSquare.row][mouseSquare.col];
                  
          let detail = {
  		      candy: board.getCandyAt(mouseSquare.row, mouseSquare.col),
  				  toRow: mouseSquare.row,
  				  toCol: mouseSquare.col,
  		      fromRow: mouseSquare.row,
  	  	    fromCol: mouseSquare.col
          };
          
          // Move candy back to original location
          board.dispatchEvent(new CustomEvent("move", {detail}));
            
          // Start hint countdown after candy returns
          Util.afterAnimation(dom.flattenedCandies, "anim-move").then(() => {
            if (!pendingNewGame) {
              startHint();
            }
          });          
        }
        
        // Indicate that candy is no longer being dragged.
        mouseSquare = null;
      }
    });
    
    // New game at page load
    rules.prepareNewGame();
    
    // Indicate that new game generation has finished
    pendingNewGame = false;
    
    // Start hint countdown
    startHint();
	},

	// Keyboard events arrive here
	"keydown": function(evt) {
		// Your code here
	},

	// Click events arrive here
	"click": function(evt) {
		// Your code here
	}
});

// Attaching events to the board
Util.events(board, {
	// add a candy to the board
	"add": function(e) {
    let img = dom.gameCandies[e.detail.toRow][e.detail.toCol];
  	let sq = dom.gameSquares[e.detail.toRow][e.detail.toCol];
    
    if (pendingNewGame) {
      // Update new position image
      img.setAttribute("src", "graphics/" + e.detail.candy.color + 
                       "-candy.png");
      img.classList.remove("hidden");
    } else {
      if (e.detail.fromRow == null) {
        e.detail.fromRow = e.detail.toRow - 1;
        e.detail.fromCol = e.detail.toCol;
      }
      
      // Hide candy prior to animation
      img.classList.add("hidden");
      
      // Update new position image
      img.setAttribute("src", "graphics/" + e.detail.candy.color + 
                       "-candy.png");
               
      // Estimate displacement relative to new position in pixels 
      let cellDist = dom.gameSquares[1][0].getBoundingClientRect().top - 
                     dom.gameSquares[0][0].getBoundingClientRect().top;    
      let dXpixels = (e.detail.fromCol - e.detail.toCol) * cellDist;
      let dYpixels = (e.detail.fromRow - e.detail.toRow) * cellDist;
      
      
      // Compute the displacement in cells
      let dX = Math.abs(e.detail.fromCol - e.detail.toCol);
      let dY = Math.abs(e.detail.fromRow - e.detail.toRow);
      let dist = Math.sqrt(dX*dX + dY*dY);
      
      // Let animation know parameters
      //
      // Note that firefox doesn't like calc inside of CSS animation duration, so we
      // compute it manually.
      let durationMove = getComputedStyle(img).getPropertyValue("--duration-move").trim()
      if (durationMove.slice(-1) == "s") {
        durationMove = durationMove.slice(0,-1).trim();
      }
      Util.css(img, {
        "--init-opacity": 0,
        "--init-dX": dXpixels + "px",
        "--init-dY": dYpixels + "px",
        "--duration-move-real": (durationMove * dist) + "s"
      });
      
      // Execute the move
      img.classList.add("move");
      
      // Remove move when finished (if not cancelled)
      Util.afterAnimation(img, "anim-move").then(() => {
        if (img.classList.contains("move")) {
          img.classList.remove("hidden");
          img.classList.remove("move");
        }
      });
    }
	},

	// move a candy from location 1 to location 2
	"move": function(e) {
    let fromImg = dom.gameCandies[e.detail.fromRow][e.detail.fromCol];
		let toImg = dom.gameCandies[e.detail.toRow][e.detail.toCol];
    
    let fromSq = dom.gameSquares[e.detail.fromRow][e.detail.fromCol];
		let toSq = dom.gameSquares[e.detail.toRow][e.detail.toCol];
        
    if (pendingNewGame) {
      // Update new position image
      toImg.setAttribute("src", "graphics/" + e.detail.candy.color + 
                         "-candy.png");
      toImg.classList.remove("hidden");
    } else {
      // Hide both candies prior to animation
      fromImg.classList.add("hidden");
      toImg.classList.add("hidden");
      
      // Get original position
      fromBounding = Util.offset(fromSq);
      fromX = fromBounding.left;
      fromY = fromBounding.top;
      
      // Offset original position by candy displacement
      let fromLeft = getComputedStyle(fromImg).getPropertyValue("left").trim();
      if (fromLeft.slice(-2) == "px") {
        fromLeft = fromLeft.slice(0,-2).trim();
      }
      fromLeft = isNaN(parseFloat(fromLeft)) ? 0 : parseFloat(fromLeft)
      let fromTop = getComputedStyle(fromImg).getPropertyValue("top").trim();
      if (fromTop.slice(-2) == "px") {
        fromTop = fromTop.slice(0,-2).trim();
      }
      fromTop = isNaN(parseFloat(fromTop)) ? 0 : parseFloat(fromTop)
      
      fromX += fromLeft;
      fromY += fromTop;
      
      // Update new position image
      toImg.setAttribute("src", "graphics/" + e.detail.candy.color + 
                         "-candy.png");
      Util.css(toImg, {
        "z-index": "",
        "--move-z-index": "moveZIndex" in e.detail ? e.detail.moveZIndex : "",
        "left": "",
        "top": ""
      });
  
      // Get new position
      toBounding = Util.offset(toSq);
      toX = toBounding.left;
      toY = toBounding.top;
      
      // Compute the displacement relative to new position in pixels          
      let dXpixels = fromX - toX;
      let dYpixels = fromY - toY;
      
      // Compute the displacement in cells
      let cellDist = dom.gameSquares[1][0].getBoundingClientRect().top - 
                     dom.gameSquares[0][0].getBoundingClientRect().top; 
      let dist = Math.sqrt(dXpixels*dXpixels + dYpixels*dYpixels) / cellDist;
      
      // Let animation know parameters
      //
      // Note that firefox doesn't like calc inside of CSS animation duration, so we
      // compute it manually.
      let durationMove = getComputedStyle(toImg).getPropertyValue("--duration-move").trim();
      if (durationMove.slice(-1) == "s") {
        durationMove = durationMove.slice(0,-1).trim();
      }
      Util.css(toImg, {
        "--init-opacity": 1,
        "--init-dX": dXpixels + "px",
        "--init-dY": dYpixels + "px",
        "--duration-move-real": (durationMove * dist) + "s"
      });
      
      // Execute the move
      toImg.classList.add("move");
      
      // Remove move when finished (if not cancelled)
      Util.afterAnimation(toImg, "anim-move").then(() => {
        if (toImg.classList.contains("move")) {
          fromImg.classList.remove("hidden");
          toImg.classList.remove("hidden");
          toImg.classList.remove("move");
        }
      });
    }
	},

	// remove a candy from the board
	"remove": function(e) {
    let img = dom.gameCandies[e.detail.fromRow][e.detail.fromCol];
    
    if (pendingNewGame) {
      img.classList.add("hidden");
    } else {
      // Hide the candy prior to animation
      img.classList.add("hidden");

      // Execute the fade
      img.classList.add("fade");

      // Remove fade when finished (if not cancelled)
      Util.afterAnimation(img, "anim-fade").then(() => {
        if (img.classList.contains("fade")) {
          img.classList.remove("fade");
        }
      });
    }
	},

	// update the score
	"scoreUpdate": function(e) {
    if (pendingNewGame) {
      Util.css(dom.scoreBox, {
        "color": "",
        "background-color": ""
      });
    } else {
      dom.score.innerHTML = e.detail.score;
      let color = e.detail.candy.color;
      let lightColors = [
        "yellow"
      ];
      let textColor = lightColors.includes(color) ? "black" : "white";
      Util.css(dom.scoreBox, {
        "color": textColor,
        "background-color": "var(--color-" + color + ")"
      });
    }
	},
});
