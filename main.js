// Our *SUPER SECURE* user database :)))
var users = {
  'dan': {
    user_type: 'coach',
    password: '1234',
  },
  'steve': {
    user_type: 'player',
    password: '1234',
  },
  'john': {
    user_type: 'player',
    password: '1234',
  },
  'kevin': {
    user_type: 'player',
    password: '1234',
  },
}

// Global state for ongoing matches. Maps match IDs to match data.
var matches = {
  "0": {
    "player1": "Steve",
    "player2": "Jim",
    "player1SideLeft": true,
    "courtEvents": [],
    "pointEvents": [0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,0,0,1,0,0,1,1,1,0,0,0,0,0,1,1,0,1,1,0,0,1,1,1,1,0,0,0,1,1,0,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,1,1,0],
    "setScore": [[3, 6], [6, 5]],
    "gameScore": [1, 3]
  },
  "1": {
    "player1": "John",
    "player2": "Andrew",
    "player1SideLeft": true,
    "courtEvents": [],
    "pointEvents": [0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,1,0,0,1,1],
    "setScore": [[2, 4]],
    "gameScore": [2, 2]
  }
}

// Variable to keep track of the next match ID
var nextMatchID = 2

// Global state for completed matches.
var pastMatches = {}

// Helpers for formatting date/time in history view.
const monthToString = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayToString = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function formatTime(time) {
  let month = monthToString[time.getMonth()]
  let date = time.getDate()
  let hour = (time.getHours() % 12 === 0) ? 12 : time.getHours() % 12
  let period = time.getHours() < 12 ? 'pm' : 'am'
  return [month, date, hour, period]
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

var court_stats_ds = {
  "forehand":[],

  "backhand":[],

  "volley":  [],

  "slice":   [],

  "serve":  [],
};

var shot_stats_ds = {
  "forehand":[],

  "backhand":[],

  "volley":  [],

  "slice":   [],

  "serve":  [],
};

function Transform_Rect_to_Trap_Coord(courtEvents)
{
  court_stats_ds = {
    "forehand":[],

    "backhand":[],

    "volley":  [],

    "slice":   [],

    "serve":  [],
  };

  shot_stats_ds = {
    "forehand":[],

    "backhand":[],

    "volley":  [],

    "slice":   [],

    "serve":  [],
  };
  const vertical_const = 0.63;

  const horizontal_cont = 0.3;

  for (i=0; i < courtEvents.length; i++)
  {
    x_rect = courtEvents[i]['percentX'];
    y_rect = courtEvents[i]['percentY'];

    bottom_trap = ((x_rect+0.5)/0.5)*vertical_const;

    if (y_rect<0){
      left_trap = y_rect*(1-horizontal_cont*((x_rect+0.5)/0.5))*1.1+0.5;
    }else{
      left_trap = y_rect*(1-horizontal_cont*((x_rect+0.5)/0.5))*1.1+0.5;
    }

    bottom_trap = bottom_trap*100;
    bottom_trap = Math.max(bottom_trap,0);
    bottom_trap = Math.min(bottom_trap,100);
    left_trap = left_trap*100;
    left_trap = Math.max(left_trap,0);
    left_trap = Math.min(left_trap,100);
    court_stats_ds[courtEvents[i]['shotType']].push([left_trap, bottom_trap]);
  }

  return court_stats_ds;

}

function draw_shot_placement(data){
  var court = document.querySelector('#tennis_stats_court');
 	// Clean out all pins
  while (court.firstChild)
  {
    court.removeChild(court.firstChild);
  }

  const pin_width = 50;
  var pin_court_ratio = 100*pin_width/document.getElementById('tennis_stats_court').offsetWidth;

  console.log("Pin/Court width = "+pin_court_ratio);

  for (i=0;i < data['forehand'].length; i++){
    pin = document.createElement('img');
    pin.setAttribute('src', "graphics/blue-pin.png");
    pin.setAttribute('class', 'shot-pin');
    pin.setAttribute('id', "forehand_"+i);
    pin.style.left = data['forehand'][i][0]-pin_court_ratio/2+"%";
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
function Check_FB_Btn(){
  if (document.getElementById("feedback_text").value.length > 0){
    ele = document.getElementById("send_fb_btn");
    ele.disabled = false;
    ele.setAttribute("class","feedback_btn");
  }else{
    ele = document.getElementById("send_fb_btn");
    ele.disabled = true;
    ele.setAttribute("class","feedback_btn_disabled");
  }
 }

// Global state for current ongoing match.
var currentMatchID = 0;

$(document).ready(function(){
  // Update the score UI at the start of the game
  updateScore();

  // Update the list of matches in menu at the the start of the game
  updateCurrentMatchesList();

  // Update the feedback name in stats view.
  updateFeedbackPlayer();

  $('body').on('click', function(e){
    if ($(e.target).closest('#menu-menu .menu-item').length === 0 && $(e.target).closest('#menu-menu .menu-popup').length === 0) {
      $('#menu-menu .menu-popup').hide()
    }
  })

  $('#menu-menu > .menu-item').on('click', function(){
    $('#menu-menu > .menu-popup').toggle()
  })


  // Bind tab buttons to tab switching
  $('#tab-logger').click(() => {
    $('#topbar-options .menu-popup').hide();
    $('#menu-popup-stats').hide();
  });

  $('#tab-stats').click(() => {
    updateFeedbackPlayer();
    updateStatsView(matches[currentMatchID]["courtEvents"]);
    $('#topbar-options .menu-popup').hide();
    $('#menu-popup-stats').show();
  });




  /* Functions related to the new match modal */
  $('#new-match').on('click', () => {
    $('#topbar-options .menu-popup').hide()
    $('#new-match-modal').show()
  })

  $('#new-match-modal .modal-submit').click(() => {
    let playerName = $('#new-match-modal select').val()
    playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1)
    let opponentName = $('#new-match-modal input').val()
    if (opponentName === "") { opponentName = "Opponent" }

    for (let id of Object.keys(matches)) {
      if (matches[id]['player1'] === playerName) {
        alert(`${playerName} already has an ongoing match!`)
        return
      }
    }

    matches[nextMatchID.toString()] = {
      player1: playerName,
      player2: opponentName,
      player1SideLeft: true,
      courtEvents: [],
      pointEvents: [],
      setScore: [],
      gameScore: []
    }
    updateCurrentMatchesList()
    switchMatch(nextMatchID.toString())
    hideNewMatchModal()
    $('#menu-tabs').show()
    $('#tab-logger').prop('checked', true)
    nextMatchID += 1
  })

  $('#new-match-modal .close').click(() => {
    hideNewMatchModal()
  })

  function hideNewMatchModal() {
    $('#new-match-modal').hide()
    $('#new-match-modal select').prop('selectedIndex', 0) //Reset dropdown
    $('#new-match-modal input').val('') //Reset text field
  }
  /* ... Functions related to the new match modal */


  /* Functions related to the end match modal */
  $('#end-match').on('click', () => {
    $('#menu-tabs').addClass('inactive')
    $('.menu-popup').hide()
    $('#end-match-modal .current-player-name').text(matches[currentMatchID]['player1'])
    $('#end-match-modal').show()
  })

  $('#end-match-modal .modal-submit').click(() => {
    archiveCurrentMatch()
    updateCurrentMatchesList()
    if (Object.keys(matches).length > 0) {
      switchMatch(Object.keys(matches)[0])
    } else {
      $('#menu-tabs').hide()
      $('#menu-popup-history').show()
    }
    $('#end-match-modal').hide()
    $('#menu-tabs').removeClass('inactive')
  })

  $('#end-match-modal .modal-cancel').click(() => {
    cancelEndMatch()
  })

  $('#end-match-modal .close').click(() => {
    cancelEndMatch()
  })

  function cancelEndMatch() {
    $('#end-match-modal').hide()
    $('#menu-tabs').show().removeClass('inactive')
    $('#tab-logger').prop('checked', true)
  }

  // Move current match to  past matches, delete it from current matches
  // Add it to the history list view.
  function archiveCurrentMatch() {
    let now = new Date()
    let nowStrings = formatTime(now)
    let matchID = currentMatchID
    pastMatches[matchID] = matches[matchID]
    pastMatches[matchID]['time'] = now

    let $historyRow = $('<tr>')
    $historyRow.attr('id', matchID)
    $historyRow.append(`<td>${nowStrings[0]} ${nowStrings[1]}</td>`)
    $historyRow.append(`<td>${nowStrings[2]} ${nowStrings[3]}</td>`)
    $historyRow.append(`<td>${matches[currentMatchID].player1} vs. ${matches[currentMatchID].player2}</td>`)
    $historyRow.on('click', () => {showPastMatchStats(matchID)})

    $('#menu-popup-history .history-table .history-table-empty').hide()
    $('#menu-popup-history .history-table').append($historyRow)
    delete matches[matchID]
  }
  /* ... Functions related to the end match modal */


  /* Functions related to the 'history' menu */
  $('#history').on('click', () => {
    $('#menu-tabs').hide()
    $('#topbar-options .menu-popup').hide()
    $('#menu-popup-history').show()
  })

  function showPastMatchStats(matchID) {
    $('#feedback_player').text(pastMatches[matchID].player1)
    updateStatsView(pastMatches[matchID]['courtEvents'])
    $('#menu-popup-history').hide()
    $('#menu-popup-stats').show()
  }
  /* ... Functions related to the 'history' menu */



  function updateStatsView(courtEvents) {
    draw_shot_placement(Transform_Rect_to_Trap_Coord(courtEvents));
    Check_FB_Btn();
    // Update Stats!
    num_forehands = court_stats_ds['forehand'].length;
    num_backhands = court_stats_ds['backhand'].length;
    num_volleys = court_stats_ds['volley'].length;
    num_slices = court_stats_ds['slice'].length;

    tot = num_forehands+num_backhands+num_volleys+num_slices;
    if (tot > 0){
      document.getElementById("forehand_stat").innerHTML = num_forehands+"/"+tot+" ("+Math.floor(num_forehands*100/tot)+"%)";
      document.getElementById("backhand_stat").innerHTML = num_backhands+"/"+tot+" ("+Math.floor(num_backhands*100/tot)+"%)";
      document.getElementById("volley_stat").innerHTML = num_volleys+"/"+tot+" ("+Math.floor(num_volleys*100/tot)+"%)";
      document.getElementById("slice_stat").innerHTML = num_slices+"/"+tot+" ("+Math.floor(num_slices*100/tot)+"%)";
    }else{
      document.getElementById("forehand_stat").innerHTML = num_forehands+"/"+tot;
      document.getElementById("backhand_stat").innerHTML = num_backhands+"/"+tot;
      document.getElementById("volley_stat").innerHTML = num_volleys+"/"+tot;
      document.getElementById("slice_stat").innerHTML = num_slices+"/"+tot;
    }
  }

  $('#send_fb_btn').on('click', function(){


    setTimeout(function(){
      $('#feedback_text').val('');
      Check_FB_Btn();
    }, 300)

    document.getElementById("feedback_text").placeholder = "Sent! Write more feedback here";
  })



  $('#feedback_text').on('keyup', function(){
    Check_FB_Btn();
  })


  // Types of shots in toolbar.
  let shotTypes = ["forehand", "backhand", "volley", "slice"]

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
        toolbarClick("slice");
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
    undo();
  });

  // Helper function for switching sides.
  function switchSides() {
    matches[currentMatchID].player1SideLeft = !matches[currentMatchID].player1SideLeft;
    if (matches[currentMatchID].player1SideLeft) {
      $('#player_left.player_label').text(matches[currentMatchID].player1)
      $('#player_right.player_label').text(matches[currentMatchID].player2)
    } else {
      $('#player_right.player_label').text(matches[currentMatchID].player1)
      $('#player_left.player_label').text(matches[currentMatchID].player2)
    }
  }

  // Bind switch sides to button.
  $('#swap_btn').click(() => {
    switchSides();
  });

  // Helper function for updating score UI
  function updateScoreUI() {
    let setScore = matches[currentMatchID].setScore;
    let gameScore = matches[currentMatchID].gameScore;

    let rowSelectors =
    [
      '#score_column_player1 > .set_score_box',
      '#score_column_player2 > .set_score_box'
    ];

    let controllerSelectors =
    [
      '#score_column_player1 > .score_controller_container',
      '#score_column_player2 > .score_controller_container'
    ];

    let scoreSelectors =
    [
      '#score_p1',
      '#score_p2'
    ];

    let playerNames =
    [
      matches[currentMatchID].player1,
      matches[currentMatchID].player2
    ];

    let gameScoreMap = ["0", "15", "30", "40", "Ad"]

    for (let playerId = 0; playerId < 2; playerId++) {
      $(rowSelectors[playerId]).each((i, e) => {
        if (i == 0) {
          $(e).html('<div class="score_player_label">' + playerNames[playerId] + '</div>');
        } else {
          setIndex = i-1;
          if (setIndex < setScore.length) {
            $(e).html('<div class="set_score_displayed">' + setScore[setIndex][playerId] + '</div>');
          } else {
            $(e).remove();
          }
        }
      });

      if (setScore.length > $(rowSelectors[playerId]).length - 1) {
        for (let setIndex = $(rowSelectors[playerId]).length - 1; setIndex < setScore.length; setIndex++) {
          $(controllerSelectors[playerId]).before(`
            <div class="set_score_box">
              <div class="set_score_displayed">` + setScore[setIndex][playerId] + `</div>
            </div>
          `);

        }
      }

      if (typeof gameScore[playerId] === "string") {
        $(scoreSelectors[playerId]).html(gameScore[playerId]);
      } else {
        $(scoreSelectors[playerId]).html(gameScoreMap[gameScore[playerId]]);
      }

    }
  }

  // Helper function for computing score, implements score changing logic.
  function computeScore(pointEvents) {
    let setScore = [[0, 0]];
    let gameScore = [0, 0];

    for (let e of pointEvents) {
      let won = e ? 1 : 0;
      let lost = 1 - won;

      if (gameScore[won] < 3) {
        gameScore[won]++;
      } else if (gameScore[won] == 3 && gameScore[lost] == 3) {
        gameScore[won]++;
      } else if (gameScore[won] == 3 && gameScore[lost] == 4) {
        gameScore[lost]--;
      } else {
        // Won the game, increment set score.
        gameScore = [0, 0];
        let lastSet = setScore[setScore.length-1];
        if (lastSet[won] < 5) {
          lastSet[won]++;
        } else if (lastSet[won] == 5 && lastSet[lost] >= 5){
          lastSet[won]++;
        } else {
          // Won the set, make new set.
          lastSet[won]++;
          setScore.push([0, 0]);
        }
      }

      // If 6 sets detected, match is over.
      if (setScore.length > 5) {
        break;
      }
    }

    // Calculate who won if needed.
    if (setScore.length > 5) {
      setScore.pop();
      let gamesWon = [0, 0]
      for (let i = 0; i < 5; i++) {
        if (setScore[i][0] > setScore[i][1]) {
          gamesWon[0]++;
        } else if (setScore[i][0] < setScore[i][1]) {
          gamesWon[1]++;
        }
      }

      if (gamesWon[0] > gamesWon[1]) {
        gameScore = ["Won", "Lost"];
      } else if (gamesWon[0] < gamesWon[1]) {
        gameScore = ["Lost", "Won"];
      } else {
        gameScore = ["Tie", "Tie"];
      }
    }

    return [setScore, gameScore];
  }

  // Helper function for updating score, both state and UI.
  function updateScore() {
    let score = computeScore(matches[currentMatchID].pointEvents);
    matches[currentMatchID].setScore = score[0];
    matches[currentMatchID].gameScore = score[1];

    updateScoreUI();
  }

  // Helper function for changing score.
  function incrementScore(playerId) {
    if (typeof matches[currentMatchID].gameScore[0] !== "string") {
      matches[currentMatchID].pointEvents.push(playerId);
      updateScore();
    }
  }

  // Helper function for undoing score.
  function undoScore() {
    matches[currentMatchID].pointEvents.pop();
    updateScore();
  }

  // Bind score increment button to changing score.
  $('.score_inc_btn').on('click', function(){
    let playerId = $(this).attr('id') === 'inc_score_p1' ? 0 : 1;
    incrementScore(playerId);
    $('#myModal').show();
  })

  // Bind undo score button to undoing the score.
  $('#score_undo').on('click', function(){
    undoScore();
  })


  // Helper function for switching matches.
  function switchMatch(matchId) {
    currentMatchID = matchId;

    // Update the names header in coach view.
    if (matches[currentMatchID].player1SideLeft) {
      $('#player_left.player_label').text(matches[currentMatchID].player1)
      $('#player_right.player_label').text(matches[currentMatchID].player2)
    } else {
      $('#player_right.player_label').text(matches[currentMatchID].player1)
      $('#player_left.player_label').text(matches[currentMatchID].player2)
    }

    // Update the feedback name.
    updateFeedbackPlayer();

    // Update the score.
    updateScore();

    // Hide all popups including history view
    $('#menu-tabs').show();
    $('#tab-logger').prop('checked', true)
    $('.menu-popup').hide();
  }

  // Updates the list of matches in the menu and binds the clicks.
  function updateCurrentMatchesList() {
    $('#current-matches-list').empty();

    let nameIds = [];
    Object.keys(matches).forEach(k => {
      nameIds.push([matches[k].player1, k]);
    });

    nameIds.sort((a, b) => a[0].localeCompare(b[0]));

    for (let n of nameIds) {
      let e = $('<div class="menu-item">' + n[0] + '</div>');
      e.click(() => switchMatch(n[1]));
      $('#current-matches-list').append(e);
    }
  }

  // Update the feedback name in stats view.
  function updateFeedbackPlayer() {
    $('#feedback_player').text(matches[currentMatchID].player1);
  }

  // Setup Error UI

  // Bind modal x to closing the modal.
  $('#shot_modal_close').click(() => $('#myModal').hide());

  // When the user clicks anywhere outside of the modal, close it
  /*
  window.onclick = function(event) {
      if (event.target == document.getElementById('myModal')) {
          $('#myModal').hide();
      }
  }
  */

  // When the user clicks a modal button, close it.
  $('.shot_ending_type').click(() => $('#myModal').hide());

  // When the user presses the Esc key, close the modal.
  $(document).keydown((e) => {
    if (e.keyCode == 27) {
      $('#myModal').hide();
    }
  });





  function showPlayerView() {
    $('#login-view').hide()
    $('#topbar').hide()
    $('#container').hide()
    $('#player-view-content').show()
  }

  function showCoachView() {
    $('#login-view').hide()
    $('#topbar').show()
    $('#container').show()
    $('#player-view-content').hide()
  }

  // Helper function for logging in
  function login() {
    let username = $('#login-username').val()
    let password = $('#login-password').val()
    if (users[username] === undefined || users[username]['password'] !== password) {
      alert('Login failed: Incorrect user name or password!')
      return
    }
    if (users[username]['user_type'] === 'coach') {
      showCoachView()
    } else {
      showPlayerView()
    }
  }

  // Bind login button
  $('#login-button').on('click',function(){
    login();
  })

  // Bind enter key to log in
  $('#login-password').keypress((e) => {
    if (e.key == "Enter") {
      login();
      return false;
    }
  });


  $('.logout').on('click',function(){
    $('#login-username').val('')
    $('#login-password').val('')
    $('#login-view').show()
  })

  showCoachView()
})
