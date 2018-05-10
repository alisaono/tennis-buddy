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

var display_player_stats = true;


// Variable to keep track of the current username
var currentUser = null

// Global state for ongoing matches. Maps match IDs to match data.
var matches = {
  "0": {
    "player1": "Steve",
    "player2": "Jim",
    "player1SideLeft": true,
    "courtEvents": [],
    "pointEvents": [0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,0,0,1,0,0,1,1,1,0,0,0,0,0,1,1,0,1,1,0,0,1,1,1,1,0,0,0,1,1,0,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,1,1,0],
    "setScore": [[3, 6], [6, 5]],
    "gameScore": [1, 3],
    "feedback": [],
  },
  "1": {
    "player1": "John",
    "player2": "Andrew",
    "player1SideLeft": true,
    "courtEvents": [],
    "pointEvents": [0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,0,1,1,1,1,0,0,1,1],
    "setScore": [[2, 4]],
    "gameScore": [2, 2],
    "feedback": [],
  }
}

// Variable to keep track of the next match ID
var nextMatchID = 2

// Global state for completed matches.
var pastMatches = {}

// Current match that's being shown on the stats view.
var currentStatsMatch = null

// Helpers for formatting date/time in history view.
const monthToString = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayToString = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function formatTime(time) {
  let month = monthToString[time.getMonth()]
  let date = time.getDate()
  let hour = (time.getHours() % 12 === 0) ? 12 : time.getHours() % 12
  let period = time.getHours() < 12 ? 'am' : 'pm'
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

  "unspecified":  [],
};

var shot_stats_ds = {
  "forehand":[],

  "backhand":[],

  "volley":  [],

  "slice":   [],

  "unspecified":  [],
};

function Transform_Rect_to_Trap_Coord(courtEvents)
{
  court_stats_ds = {
    "forehand":[],

    "backhand":[],

    "volley":  [],

    "slice":   [],

    "unspecified":  [],
  };

  shot_stats_ds = {
    "forehand":[],

    "backhand":[],

    "volley":  [],

    "slice":   [],

    "unspecified":  [],
  };
  /*
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
    if (court_stats_ds[courtEvents[i]['shotType']]) { // In case the shotType is 'undefined'
      court_stats_ds[courtEvents[i]['shotType']].push([left_trap, bottom_trap]);
    }
  }*/
  for (i=0; i < courtEvents.length; i++)
  {
    x_rect = courtEvents[i]['percentX'];
    y_rect = courtEvents[i]['percentY'];

    bottom_trap = x_rect+0.5;

    left_trap = y_rect+0.5;

    bottom_trap = bottom_trap*100;
    //bottom_trap = Math.max(bottom_trap,0);
    //bottom_trap = Math.min(bottom_trap,100);
    left_trap = left_trap*100;
    //left_trap = Math.max(left_trap,0);
    //left_trap = Math.min(left_trap,100);
    console.log("Converted "+x_rect+","+y_rect+" to: ");
    console.log("Converted "+bottom_trap+","+left_trap);

    if (court_stats_ds[courtEvents[i]['shotType']]) { // In case the shotType is 'undefined'
      court_stats_ds[courtEvents[i]['shotType']].push([left_trap, bottom_trap]);
    }
  }
  return court_stats_ds;

}

function draw_shot_placement(selector, data){
  var court = document.querySelector(selector);
 	// Clean out all pins
  while (court.firstChild)
  {
    court.removeChild(court.firstChild);
  }

  //const pin_width = 50;
  //console.log(document.getElementById('tennis_stats_court').offsetWidth);
  //var pin_court_ratio = 100*pin_width/document.getElementById('tennis_stats_court').offsetWidth;

  //console.log("Pin/Court width = "+pin_court_ratio);
  if (display_player_stats){

    for (i=0;i < data['forehand'].length; i++){
      if (data['forehand'][i][1] <= 50){
        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/blue-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "forehand_"+i);
        pin.style.left = data['forehand'][i][0]+"%";
        pin.style.bottom = data['forehand'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['backhand'].length; i++){
      if (data['backhand'][i][1] <= 50){
        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/red-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "backhand_"+i);
        pin.style.left = data['backhand'][i][0]+"%";
        pin.style.bottom = data['backhand'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['volley'].length; i++){
      if (data['volley'][i][1] <= 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/pink-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "volley_"+i);
        pin.style.left = data['volley'][i][0]+"%";
        pin.style.bottom = data['volley'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['slice'].length; i++){
      if (data['slice'][i][1] <= 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/black-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "slice_"+i);
        pin.style.left = data['slice'][i][0]+"%";
        pin.style.bottom = data['slice'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['unspecified'].length; i++){
      if (data['unspecified'][i][1] <= 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/green-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "unspecified_"+i);
        pin.style.left = data['unspecified'][i][0]+"%";
        pin.style.bottom = data['unspecified'][i][1]+"%";
        court.append(pin);
      }
    }

  }else{
    for (i=0;i < data['forehand'].length; i++){
      if (data['forehand'][i][1] > 50){
        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/blue-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "forehand_"+i);
        pin.style.left = data['forehand'][i][0]+"%";
        pin.style.bottom = data['forehand'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['backhand'].length; i++){
      if (data['backhand'][i][1] > 50){
        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/red-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "backhand_"+i);
        pin.style.left = data['backhand'][i][0]+"%";
        pin.style.bottom = data['backhand'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['volley'].length; i++){
      if (data['volley'][i][1] > 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/pink-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "volley_"+i);
        pin.style.left = data['volley'][i][0]+"%";
        pin.style.bottom = data['volley'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['slice'].length; i++){
      if (data['slice'][i][1] > 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/black-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "slice_"+i);
        pin.style.left = data['slice'][i][0]+"%";
        pin.style.bottom = data['slice'][i][1]+"%";
        court.append(pin);
      }
    }

    for (i=0;i < data['unspecified'].length; i++){
      if (data['unspecified'][i][1] > 50){

        pin = document.createElement('img');
        pin.setAttribute('src', "graphics/green-pin.png");
        pin.setAttribute('class', 'shot-pin');
        pin.setAttribute('id', "unspecified_"+i);
        pin.style.left = data['unspecified'][i][0]+"%";
        pin.style.bottom = data['unspecified'][i][1]+"%";
        court.append(pin);
      }
    }

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
    $('#menu-popup-history').hide()
    $('#container').show();
  });

  $('#tab-stats').click(() => {
    updateFeedbackPlayer();
    updateStatsView('#tennis_stats_court', matches[currentMatchID]["courtEvents"]);
    coachToggleClick(true);
    $('#topbar-options .menu-popup').hide();
    $('#container').hide();
    $('#menu-popup-history').hide()
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
      gameScore: [],
      feedback: [],
    }
    updateCurrentMatchesList()
    switchMatch(nextMatchID.toString())
    hideNewMatchModal()
    
    $('#menu-popup-stats').hide()
    $('#menu-popup-history').hide()
    $('#container').show()
    
    $('#menu-tabs').show()
    $('#end-match').show()
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


  /* Functions related to the all current matches modal */
  $('#current-matches > .menu-item').on ('click', () => {
    $('#topbar-options .menu-popup').hide()
    $('#all-current-matches-modal').show()
  })

  $('#all-current-matches-modal .close').click(() => {
    $('#all-current-matches-modal').hide()
  })
  /* ... Functions related to the all current matches modal */


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
      $('#end-match').hide()
      
      $('#container').hide()
      $('#menu-popup-stats').hide()
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
    
    $('#container').hide()
    $('#menu-popup-stats').hide()
    $('#menu-popup-history').show()
  })

  function showPastMatchStats(matchID) {
    currentStatsMatch = pastMatches[matchID]
    $('#feedback_player').text(pastMatches[matchID].player1)
    updateStatsView('#tennis_stats_court', pastMatches[matchID]['courtEvents'])
    coachToggleClick(true)
    
    $('#container').hide()
    $('#menu-popup-history').hide()
    $('#menu-popup-stats').show()
  }
  /* ... Functions related to the 'history' menu */


  /* Functions related to the player-side history menu */
  $('#player-matches').on('click', () => {
    updatePlayerHistoryView()
    $('#topbar-options .menu-popup').hide()
    
    $('#player-view-content').hide()
    $('#menu-popup-player-history').show()
  })

  function updatePlayerHistoryView() {
    $('#menu-popup-player-history .history-table tr').not('.history-table-empty').remove()
    let empty = true
    for (let matchID of Object.keys(pastMatches)) {
      if (pastMatches[matchID].player1.toLowerCase() === currentUser) {
        empty = false
        let timeStrings = formatTime(pastMatches[matchID]['time'])
        let $historyRow = $('<tr>')
        $historyRow.attr('id', matchID)
        $historyRow.append(`<td>${timeStrings[0]} ${timeStrings[1]}</td>`)
        $historyRow.append(`<td>${timeStrings[2]} ${timeStrings[3]}</td>`)
        $historyRow.append(`<td>You vs. ${pastMatches[matchID].player2}</td>`)
        $historyRow.on('click', () => {showPlayerMatchStats(matchID)})
        $('#menu-popup-player-history .history-table').append($historyRow)
      }
    }
    if (empty) {
      $('#menu-popup-player-history .history-table .history-table-empty').show()
    } else {
      $('#menu-popup-player-history .history-table .history-table-empty').hide()
    }
  }

  function showPlayerMatchStats(matchID) {
    currentStatsMatch = pastMatches[matchID]
    updateStatsView('#tennis_player_stats_court', pastMatches[matchID]['courtEvents'])
    playerToggleClick(true)
    $('#player-view-content .feedback_viewer_text_container').remove()
    let feedbacks = pastMatches[matchID].feedback
    if (feedbacks.length > 0) {
      $('#player-view-content .feedback_viewer_header_container')
        .html('Feedback from coach:')
        .css('text-align', 'left')
      for (let f of feedbacks) {
        let coachName = f.coach.charAt(0).toUpperCase() + f.coach.slice(1)
        let $feedback = $('<div>')
        $feedback.addClass('feedback_viewer_text_container')
        $feedback.html(`${coachName} said "${f.text}"`)
        $('#player-view-content .feedback_viewer_container').append($feedback)
      }
    } else {
      $('#player-view-content .feedback_viewer_header_container')
        .html('No feedback from coach yet.')
        .css('text-align', 'center')
    }
    $('#player-view-content').show()
    $('#menu-popup-player-history').hide()
  }
  /* ... Functions related to the player-side history menuu */



  function updateStatsView(courtSelector, courtEvents) {
    draw_shot_placement(courtSelector, Transform_Rect_to_Trap_Coord(courtEvents));
    Check_FB_Btn();
    // Update Stats!
    num_forehands = court_stats_ds['forehand'].length;
    num_backhands = court_stats_ds['backhand'].length;
    num_volleys = court_stats_ds['volley'].length;
    num_slices = court_stats_ds['slice'].length;
    num_unspec = court_stats_ds['unspecified'].length;

    tot = num_forehands+num_backhands+num_volleys+num_slices+num_unspec;
    if (tot > 0){
      $(".forehand_stat").html(num_forehands+"/"+tot+" ("+Math.floor(num_forehands*100/tot)+"%)")
      $(".backhand_stat").html(num_backhands+"/"+tot+" ("+Math.floor(num_backhands*100/tot)+"%)")
      $(".volley_stat").html(num_volleys+"/"+tot+" ("+Math.floor(num_volleys*100/tot)+"%)")
      $(".slice_stat").html(num_slices+"/"+tot+" ("+Math.floor(num_slices*100/tot)+"%)")
      $(".unspecified_stat").html(num_unspec+"/"+tot+" ("+Math.floor(num_unspec*100/tot)+"%)")

    }else{
      $(".forehand_stat").html(num_forehands+"/"+tot)
      $(".backhand_stat").html(num_backhands+"/"+tot)
      $(".volley_stat").html(num_volleys+"/"+tot)
      $(".slice_stat").html(num_slices+"/"+tot)
      $(".unspecified_stat").html(num_unspec+"/"+tot)
    }
  }

  $('#send_fb_btn').on('click', function(){
    let feedback = $('#feedback_text').val()
    if (feedback.length === 0) { return }
    $('#feedback_text').prop('disabled', true)
    $('#send_fb_btn').prop('disabled', true).removeClass('feedback_btn').addClass('feedback_btn_disabled')
    setTimeout(function(){
      currentStatsMatch.feedback.push({
        coach: currentUser,
        text: feedback
      })
      $('#feedback_text').val('')
      $('#feedback_text').attr('placeholder', "Sent! Write more feedback here")
      $('#feedback_text').prop('disabled', false)
    }, 300)
  })

  // Helper functions for stats toggle button clicks.
  function coachToggleClick(isPlayerPosition) {
    $('.stats-toggle-button').removeClass("active");
    display_player_stats = isPlayerPosition;
    if (isPlayerPosition) {
      $('#coach-player-position-button').addClass("active");
    } else {
      $('#coach-shot-position-button').addClass("active");
    }

    // Checks if past match is being viewed by visibility of the menu tabs.
    if ($('#menu-tabs').is(':visible')) {
      updateStatsView('#tennis_stats_court', matches[currentMatchID]['courtEvents']);
    } else {
      updateStatsView('#tennis_stats_court', currentStatsMatch['courtEvents']);
    }
  }
  function playerToggleClick(isPlayerPosition) {
    $('.stats-toggle-button').removeClass("active");
    display_player_stats = isPlayerPosition;
    if (isPlayerPosition) {
      $('#player-player-position-button').addClass("active");
    } else {
      $('#player-shot-position-button').addClass("active");
    }

    updateStatsView('#tennis_player_stats_court', currentStatsMatch['courtEvents']);
  }

  // Bind stats toggle button clicks.
  $('#coach-shot-position-button').click(() => coachToggleClick(false));
  $('#coach-player-position-button').click(() => coachToggleClick(true));
  $('#player-shot-position-button').click(() => playerToggleClick(false));
  $('#player-player-position-button').click(() => playerToggleClick(true));


  $('#feedback_text').on('keyup', function(){
    Check_FB_Btn();
  })


  // Types of shots in toolbar.
  let shotTypes = ["forehand", "backhand", "volley", "slice", "unspecified"]

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
    if ($('#logging-toolbar').is(':visible') && !($('.modal').is(':visible'))) {
      if (e.key == "f" || e.key == "F") {
        toolbarClick("forehand");
      } else if (e.key == "b" || e.key == "B") {
        toolbarClick("backhand");
      } else if (e.key == "v" || e.key == "V") {
        toolbarClick("volley");
      } else if (e.key == "s" || e.key == "S") {
        toolbarClick("slice");
      } else if (e.key == "u" || e.key == "U") {
        toolbarClick("unspecified");
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

  // Helper function for modifying opponent names.
  function opponentNameChanger(s) {
    if (s.toLowerCase() === "opponent") {
      return "Opponent";
    } else {
      return "Opponent (&nbsp;" + s + "&nbsp;)";
    }
  }

  // Helper function for switching sides.
  function switchSides() {
    matches[currentMatchID].player1SideLeft = !matches[currentMatchID].player1SideLeft;
    if (matches[currentMatchID].player1SideLeft) {
      $('#player_left.player_label').html(matches[currentMatchID].player1)
      $('#player_right.player_label').html(opponentNameChanger(matches[currentMatchID].player2))
    } else {
      $('#player_right.player_label').html(matches[currentMatchID].player1)
      $('#player_left.player_label').html(opponentNameChanger(matches[currentMatchID].player2))
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
        // Won, Lost, or Tie
        $(scoreSelectors[playerId]).html(gameScore[playerId]);
        $('.score_inc_btn').hide();
      } else {
        // Game still ongoing
        $(scoreSelectors[playerId]).html(gameScoreMap[gameScore[playerId]]);
        $('.score_inc_btn').show();
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

      // If someone has won 3 sets, match is over.
      let setsWon = [0, 0]
      for (let i = 0; i < setScore.length-1; i++) {
        if (setScore[i][0] > setScore[i][1]) {
          setsWon[0]++;
        } else if (setScore[i][0] < setScore[i][1]) {
          setsWon[1]++;
        }
      }
      if (setsWon[0] >= 3 || setsWon[1] >= 3) {
        break;
      }
    }

    // Calculate who won if needed.
    let setsWon = [0, 0]
    for (let i = 0; i < setScore.length-1; i++) {
      if (setScore[i][0] > setScore[i][1]) {
        setsWon[0]++;
      } else if (setScore[i][0] < setScore[i][1]) {
        setsWon[1]++;
      }
    }
    if (setsWon[0] >= 3 || setsWon[1] >= 3 || setScore.length > 5) {
      setScore.pop();
      if (setsWon[0] > setsWon[1]) {
        gameScore = ["Won", "Lost"];
      } else if (setsWon[0] < setsWon[1]) {
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
      $('#player_left.player_label').html(matches[currentMatchID].player1)
      $('#player_right.player_label').html(opponentNameChanger(matches[currentMatchID].player2))
    } else {
      $('#player_right.player_label').html(matches[currentMatchID].player1)
      $('#player_left.player_label').html(opponentNameChanger(matches[currentMatchID].player2))
    }

    // Update the feedback name.
    updateFeedbackPlayer();

    // Update the score.
    updateScore();

    // Hide all popups including history view
    $('#menu-tabs').show();
    $('#tab-logger').prop('checked', true)
    $('.menu-popup').hide();
    $('#container').show();
  }

  // Updates the list of matches in the menu and binds the clicks.
  function updateCurrentMatchesList() {
    $('#current-matches-empty').hide();
    $('#current-matches-list').empty();
    $('#all-current-matches-modal table').empty();
    $('#current-matches > .menu-item').show();

    let nameIds = [];
    Object.keys(matches).forEach(k => {
      nameIds.push([matches[k].player1, k]);
    });

    nameIds.sort((a, b) => a[0].localeCompare(b[0]));

    for (let n of nameIds) {
      let $tr = $('<tr>').append(`<td>${n[0]}</td>`).click(function(){
        $('#all-current-matches-modal').hide();
        switchMatch(n[1]);
      })
      $('#all-current-matches-modal table').append($tr);
    }

    if (nameIds.length === 0) {
      $('#current-matches > .menu-item').hide();
      $('#current-matches-empty').show();
    }
  }

  // Update the feedback name in stats view.
  function updateFeedbackPlayer() {
    currentStatsMatch = matches[currentMatchID]
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
      $('.modal-content .close:visible').trigger('click');
      //$('#myModal').hide();
    }
  });





  function showPlayerView() {
    $('#login-view').hide()
    
    $('#topbar').hide()
    $('#container').hide()
    $('#menu-popup-stats').hide()
    $('#menu-popup-history').hide()
    
    $('.modal').hide()

    $('#player-view-topbar').show()

    updatePlayerHistoryView()
    $('#menu-popup-player-history').show()
    $('#player-view-content').hide()
  }

  function showCoachView() {
    $('#login-view').hide()
    
    $('#player-view-topbar').hide()
    $('#player-view-content').hide()
    $('#menu-popup-player-history').hide()

    $('.modal').hide()
    
    $('#topbar').show()

    if (Object.keys(matches).length > 0) {
      $('#menu-popup-stats').hide()
      $('#menu-popup-history').hide()
      $('#container').show()
    
      switchSides();
      switchSides();// Hack
      toolbarClick("unspecified")
      
      switchMatch(Object.keys(matches)[0])
    } else {
      $('#menu-tabs').hide()
      $('#end-match').hide()
      
      $('#container').hide()
      $('#menu-popup-stats').hide()
      $('#menu-popup-history').show()
    }
  }

  // Helper function for logging in
  function login() {
    let username = $('#login-username').val()
    let password = $('#login-password').val()
    if (users[username] === undefined || users[username]['password'] !== password) {
      alert('Login failed: Incorrect user name or password!')
      return
    }
    currentUser = username
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
})
