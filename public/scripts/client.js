$(document).ready(function() {

  // if flash message exists, set timeout to fade out message after 5 seconds
  (function () {
    var checkForFlashMessage = $('.flashMessage').html();
    if (checkForFlashMessage) {
      setTimeout(function() {
        $('.flashMessage').fadeOut('slow');
      }, 5000);
    }
  })();

  // if submit button clicked display loader
  $('.submitBtnIndex').on('click', function() {
    var textAreaVal = $('input[name="sIndex"]').val();
    if (textAreaVal) {
      $('.loader').addClass('show');
    };
  });
});
