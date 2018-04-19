$(document).ready(function(){
  $('body').on('click', function(e){
    if (e.target.className !== 'menu-item' && e.target.className !== 'menu-popup') {
      $(`.menu-popup`).hide()
    }
  })

  $('#nav-bar .menu-item').on('click', function(){
    let $popup = $(this).parent().children('.menu-popup')
    let hidden = $popup.css('display') === 'none'
    $(`.menu-popup`).hide()
    if (hidden) {
      $popup.show()
    }
  })
})
