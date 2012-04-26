!function($) {

  $.fn.imgUp = function(opts) {

    opts = $.extend({}, $.fn.imgUp.defaults, opts);

    return this.each(function() {
      var el = $(this);

      var showProgress = function() {
        el.html(opts.progressTemplate);
      };

      var showComplete = function(img) {
        el
          .html(opts.completeTemplate)
          .find('img')
            .attr('src', img);
      };


      var form = $('<form/>')
        .attr({
          action: opts.action,
          method: opts.method,
          enctype: 'multipart/form-data'
        })
        .appendTo('body');

      var input = $('<input/>')
        .attr({
          name: opts.postKey,
          type: 'file'
        })
        .css({
          opacity: '0',
          cursor: 'pointer',
          position: 'absolute'
        })
        .on('change', function() {
          el.trigger('fileSelect');
          showProgress();
          form.submit();
        })
        .appendTo(form);

      form
        .framejax()
        .on('complete', function(e, results) {
          console.log('complete', results);
          showComplete(results);
        });

      el.on('mousemove', function(e) {
        var h = input.height();
        var w = input.width();
        input.css({
          top: e.offsetY - (h/2),
          left: e.offsetX - (w - 30)
        });
      });
    });

  };

  $.fn.imgUp.defaults = {
    action: window.location.href,
    method: 'POST',
    postKey: 'image',
    progressTemplate: '<span class="progress">Uploading...</span>',
    completeTemplate: '<img/>'
  };

}(window.jQuery);
