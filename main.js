// Global state for ongoing matches. Maps match IDs to match data.
var matches = {
  "0": {
    "player1": "Bob",
    "player2": "Todd",
    "player1SideLeft": true,
    "courtEvents": []
  },
  "1": {
    "player1": "Andrew",
    "player2": "Bill",
    "player1SideLeft": true,
    "courtEvents": []
  }
}

var dummy_court_stats_0 = {
  "forehand":[[80,8],
              [70,15],
              [85,20],
              [84,5],
              [75,13],
              [60,10]],

  "backhand":[[10,8],
              [15,15],
              [13,20],
              [4,5],
              [11,13],
              [20,10]],

  "volley":  [[40,65],
              [50,55],
              [44,58],
              [51,50],
              [57,50],
              [55,71]],

  "slice":   [[15,15],
              [20,30],
              [5,27]],
}

function draw_shot_placement(data){
  var court = document.querySelector('#tennis_stats_court');
 	// Clean out all pins
  while (court.firstChild)
  {
    court.removeChild(court.firstChild);
  }

  for (i=0;i < data['forehand'].length; i++){
    pin = document.createElement('img');
    pin.setAttribute('src', "graphics/blue-pin.png");
    pin.setAttribute('class', 'shot-pin');
    pin.setAttribute('id', "forehand_"+i);
    pin.style.left = data['forehand'][i][0]+"%";
    pin.style.bottom = data['forehand'][i][1]+"%";
    court.append(pin);
  }

  for (i=0;i < data['backhand'].length; i++){
    pin = document.createElement('img');
    pin.setAttribute('src', "graphics/red-pin.png");
    pin.setAttribute('class', 'shot-pin');
    pin.setAttribute('id', "backhand_"+i);
    pin.style.left = data['backhand'][i][0]+"%";
    pin.style.bottom = data['backhand'][i][1]+"%";
    court.append(pin);
  }

  for (i=0;i < data['volley'].length; i++){
    pin = document.createElement('img');
    pin.setAttribute('src', "graphics/pink-pin.png");
    pin.setAttribute('class', 'shot-pin');
    pin.setAttribute('id', "volley_"+i);
    pin.style.left = data['volley'][i][0]+"%";
    pin.style.bottom = data['volley'][i][1]+"%";
    court.append(pin);
  }

  for (i=0;i < data['slice'].length; i++){
    pin = document.createElement('img');
    pin.setAttribute('src', "graphics/black-pin.png");
    pin.setAttribute('class', 'shot-pin');
    pin.setAttribute('id', "slice_"+i);
    pin.style.left = data['slice'][i][0]+"%";
    pin.style.bottom = data['slice'][i][1]+"%";
    court.append(pin);
  }
}

// Global state for current ongoing match.
var currentMatchID = 0;

$(document).ready(function(){
  $('body').on('click', function(e){
    if ($(e.target).closest('.menu-item').length === 0 && $(e.target).closest('.menu-popup').length === 0) {
      $('.menu-popup').hide()
      $('.menu-subpopup').hide()
    }
  })

  $('#nav-bar > .menu-item-wrapper > .menu-item').not('#menu-undo .menu-item').on('click', function(){
    let $popup = $(this).parent().children('.menu-popup')
    let hidden = $popup.css('display') === 'none'
    $('.menu-popup').hide()
    $('.menu-subpopup').hide()
    if (hidden) {
      $popup.show()
    }
  })

  $('#menu-menu > .menu-item').on('click', function(){
    $('#menu-menu > .menu-popup').toggle()
  })

  $('#menu-stats > .menu-item').on('click', function(){
    let hidden = $('#menu-popup-stats').css('display') === 'none'
    $('#menu-popup-stats').hide()
    $('#menu-popup-stats .menu-subpopup').hide()
    if (hidden) {
      $('#menu-popup-stats').show()
    }
  })

  $('#current-matches').on('click', function(){
    $('#current-matches').children('.menu-subpopup').show()
  })

  $('#stats_menu_btn').on('click', function(){
    $(this).parent().children('.menu-subpopup').show();
  })

  $('#view-stats-btn').on('click', function(){
    draw_shot_placement(dummy_court_stats_0);
  })

  $('#feedback_menu .feedback_btn').on('click', function(){
    $('#feedback_menu').parent().hide()
  })

  // Types of shots in toolbar.
  let shotTypes = ["forehand", "backhand", "volley", "serve"]

  // Make court undraggable.
  $('#tennis-court').on("dragstart", () => {
    return false;
  });

  // Make player visible and start countdown towards hiding player.
  let playerTimeoutID = null;
  function startPlayer() {
    clearTimeout(playerTimeoutID);
    $('#tennis-player').removeClass("hidden");
    playerTimeoutID = setTimeout(() => {
      $('#tennis-player').addClass("hidden");
    }, 3000);
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
    }, 3000);
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
    let xBoundary = courtBounding.left + courtBounding.width/2;
    let yBoundary = courtBounding.top + courtBounding.height/2;

    let percentX = (e.clientX - xBoundary)/courtBounding.width;
    let percentY = (e.clientY - yBoundary)/courtBounding.height;

    if ((percentX <= 0 && matches[currentMatchID].player1SideLeft) ||
        (percentX > 0 && !matches[currentMatchID].player1SideLeft)) {
      matches[currentMatchID].courtEvents.push({
        "timestamp": Date.now(),
        "eventType": "shot",
        "playerSide": true,
        "shotType": activeShotType === null ? "unspecified" : activeShotType,
        "percentX": matches[currentMatchID].player1SideLeft ? percentX : -percentX,
        "percentY": matches[currentMatchID].player1SideLeft ? percentY : -percentY
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
        "shotType": activeShotType === null ? "unspecified" : activeShotType,
        "percentX": matches[currentMatchID].player1SideLeft ? percentX : -percentX,
        "percentY": matches[currentMatchID].player1SideLeft ? percentY : -percentY
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
          let xBoundary = courtBounding.left + courtBounding.width/2;
          let yBoundary = courtBounding.top + courtBounding.height/2;

          let percentX = matches[currentMatchID].player1SideLeft ? lastEvent.percentX : -lastEvent.percentX;
          let percentY = matches[currentMatchID].player1SideLeft ? lastEvent.percentY : -lastEvent.percentY;

          $('#tennis-player-red').css({
            "left": xBoundary + courtBounding.width * percentX,
            "top": yBoundary + courtBounding.height * percentY
          });

          stopAllCourtPopups();
          startPlayerRed();
        } else {
          let courtBounding = document.getElementById("tennis-court").getBoundingClientRect();
          let xBoundary = courtBounding.left + courtBounding.width/2;
          let yBoundary = courtBounding.top + courtBounding.height/2;

          let percentX = matches[currentMatchID].player1SideLeft ? lastEvent.percentX : -lastEvent.percentX;
          let percentY = matches[currentMatchID].player1SideLeft ? lastEvent.percentY : -lastEvent.percentY;


          $('#tennis-ball-red').css({
            "left": xBoundary + courtBounding.width * percentX,
            "top": yBoundary + courtBounding.height * percentY
          });

          stopAllCourtPopups();
          startBallRed();
        }
        matches[currentMatchID].courtEvents.pop();
      }
    }
  }

  // Bind undo to button.
  $('#menu-undo').click(() => {
    $('.menu-popup').hide()
    $('.menu-subpopup').hide()
    undo();
  });

  // Helper function for switching sides.
  function switchSides() {
    matches[currentMatchID].player1SideLeft = !matches[currentMatchID].player1SideLeft;
  }

  // Bind switch sides to button.
  $('#swap_btn').click(() => {
    switchSides();
  });
})
