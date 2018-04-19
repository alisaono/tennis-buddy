// Global state for ongoing matches. Maps match IDs to match data.
var matches = {
  "0": {
    "player1": "Bob",
    "player2": "Todd",
    "courtEvents": []
  },
  "1": {
    "player1": "Andrew",
    "player2": "Bill",
    "courtEvents": []
  }
}

// Global state for current ongoing match.
var currentMatchID = 0;

$(document).ready(function(){
  $('body').on('click', function(e){
    if (e.target.className !== 'menu-item' && e.target.className !== 'menu-popup') {
      $(`.menu-popup`).hide()
    }
  })

  $('#nav-bar .menu-item').not('#menu-undo > .menu-item').on('click', function(){
    let $popup = $(this).parent().children('.menu-popup')
    let hidden = $popup.css('display') === 'none'
    $(`.menu-popup`).hide()
    if (hidden) {
      $popup.show()
    }
  })
  
  
  let shotTypes = ["forehand", "backhand", "volley", "serve"]
  
  // Make player visible and start countdown towards hiding player.
  let playerTimeoutID = null;
  function startPlayer() {
    clearTimeout(playerTimeoutID);
    $('#tennis-player').removeClass("hidden");
    playerTimeoutID = setTimeout(() => {
      $('#tennis-player').addClass("hidden");
    }, 1000);
  }
    
  // Clear player countdowns and hide player.
  function stopPlayer() {
    clearTimeout(playerTimeoutID);
    $('#tennis-player').addClass("hidden");
    playerTimeoutID = null;
  }

  // Make ball visible and start countdown towards hiding ball.
  let ballTimeoutID = null;
  function startBall() {
    clearTimeout(ballTimeoutID);
    $('#tennis-ball').removeClass("hidden");
    ballTimeoutID = setTimeout(() => {
      $('#tennis-ball').addClass("hidden");
    }, 1000);
  }
    
  // Clear ball countdowns and hide ball.
  function stopBall() {
    clearTimeout(ballTimeoutID);
    $('#tennis-ball').addClass("hidden");
    ballTimeoutID = null;
  }
  
  // Make red player visible and start countdown towards hiding red player.
  let playerRedTimeoutID = null;
  function startPlayerRed() {
    clearTimeout(playerRedTimeoutID);
    $('#tennis-player-red').removeClass("hidden");
    playerRedTimeoutID = setTimeout(() => {
      $('#tennis-player-red').addClass("hidden");
    }, 1000);
  }
    
  // Clear red player countdowns and hide red player.
  function stopPlayerRed() {
    clearTimeout(playerRedTimeoutID);
    $('#tennis-player-red').addClass("hidden");
    playerRedTimeoutID = null;
  }

  // Make red ball visible and start countdown towards hiding red ball.
  let ballRedTimeoutID = null;
  function startBallRed() {
    clearTimeout(ballRedTimeoutID);
    $('#tennis-ball-red').removeClass("hidden");
    ballRedTimeoutID = setTimeout(() => {
      $('#tennis-ball-red').addClass("hidden");
    }, 1000);
  }
    
  // Clear red ball countdowns and hide red ball.
  function stopBallRed() {
    clearTimeout(ballRedTimeoutID);
    $('#tennis-ball-red').addClass("hidden");
    ballRedTimeoutID = null;
  }
  
  // Clear all countdowns and players/balls.
  function stopAllCourtPopups() {
    stopPlayer();
    stopBall();
    stopPlayerRed();
    stopBallRed();
  }
  
  // Catch mouse clicks on the tennis court.
  $('#tennis-court').mousedown(function(e) {
    let courtBounding = document.getElementById("tennis-court").getBoundingClientRect();
    let xBoundary = courtBounding.left + courtBounding.width/2
    if (e.clientX < xBoundary) {
      matches[currentMatchID].courtEvents.push({
        "timestamp": Date.now(),
        "eventType": "shot",
        "playerSide": true,
        "shotType": activeShotType,
        "percentX": (e.clientX - courtBounding.left)/courtBounding.width,
        "percentY": (e.clientY - courtBounding.top)/courtBounding.height
      });
      
      let playerBounding = document.getElementById("tennis-player").getBoundingClientRect();
      $('#tennis-player').css({
        "left": e.clientX,
        "top": e.clientY
      });
      
      stopAllCourtPopups();
      startPlayer();
    } else {
      matches[currentMatchID].courtEvents.push({
        "timestamp": Date.now(),
        "eventType": "shot",
        "playerSide": false,
        "shotType": activeShotType,
        "percentX": (e.clientX - courtBounding.left)/courtBounding.width,
        "percentY": (e.clientY - courtBounding.top)/courtBounding.height
      });

      let ballBounding = document.getElementById("tennis-ball").getBoundingClientRect();
      $('#tennis-ball').css({
        "left": e.clientX,
        "top": e.clientY
      });
      
      stopAllCourtPopups();
      startBall();
    }
  })
  
  // Helper function for toolbar button clicks.
  let activeShotType = null;
  function toolbarClick(shotType) {
    $('.toolbar-button').removeClass("active");
    activeShotType = shotType;
    $('#' + shotType + "-button").addClass("active");
  }
  
  // Bind toolbar button clicks.
  shotTypes.forEach(shotType => {
    $('#' + shotType + '-button').click(() => toolbarClick(shotType));
  });
  
  // Keyboard bindings for toolbar buttons.
  $('body').keydown(function(e) {
    if ($('#logging-toolbar').is(':visible')) {
      if (e.key == "f" || e.key == "F") {
        toolbarClick("forehand");
      } else if (e.key == "b" || e.key == "B") {
        toolbarClick("backhand");
      } else if (e.key == "v" || e.key == "V") {
        toolbarClick("volley");
      } else if (e.key == "s" || e.key == "S") {
        toolbarClick("serve");
      }
    }
  })
  
  // Helper function for undo.
  function undo() {
    let lastEvent = matches[currentMatchID].courtEvents.slice(-1)[0];
    if (lastEvent !== undefined) {
      if (lastEvent.eventType == "shot") {
        if (lastEvent.playerSide) {
          let courtBounding = document.getElementById("tennis-court").getBoundingClientRect();
          
          $('#tennis-player-red').css({
            "left": courtBounding.left + courtBounding.width * lastEvent.percentX,
            "top": courtBounding.top + courtBounding.height * lastEvent.percentY
          });
          
          stopAllCourtPopups();
          startPlayerRed();
        } else {
          let courtBounding = document.getElementById("tennis-court").getBoundingClientRect();
          
          $('#tennis-ball-red').css({
            "left": courtBounding.left + courtBounding.width * lastEvent.percentX,
            "top": courtBounding.top + courtBounding.height * lastEvent.percentY
          }); 
          
          stopAllCourtPopups();
          startBallRed();
        }
        matches[currentMatchID].courtEvents.pop();
      }
    }
  }
  
  // Bind undo to button.
  $('#menu-undo > .menu-item').click(() => {
    undo();
  });
  
})
