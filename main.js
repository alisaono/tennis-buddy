$(document).ready(function(){
  $('#nav-bar .menu-item').on('click', function(){
    let menuId = $(this).parent().attr('id')
    $(`.menu-popup`).hide()
    $(`#${menuId} .menu-popup`).show()
  })
})
