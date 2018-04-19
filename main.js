$(document).ready(function(){
  $('body').on('click', function(e){
    if (e.target.className !== 'menu-item' && e.target.className !== 'menu-popup') {
      $('.menu-popup').hide()
      $('.menu-subpopup').hide()
    }
  })

  $('#nav-bar > .menu-item-wrapper > .menu-item').on('click', function(){
    let $popup = $(this).parent().children('.menu-popup')
    let hidden = $popup.css('display') === 'none'
    $('.menu-popup').hide()
    $('.menu-subpopup').hide()
    if (hidden) {
      $popup.show()
    }
  })

  $('#current-matches').on('click', function(){
    $(this).children('.menu-subpopup').show()
  })
})
