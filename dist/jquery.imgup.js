/*!
  * imgUp 
  * v0.1.0
  * https://github.com/jgallen23/imgup
  * copyright JGA 2012
  * MIT License
  */

/*!
  * jquery.framejax 
  * v0.1.1
  * https://github.com/jgallen23/framejax
  * copyright JGA 2012
  * MIT License
  */

!function($) {
  var lastId = 0;
  var createiFrame = function(id) {
    return $('<iframe/>')
      .attr({
        id: id,
        name: id,
        width: 0,
        height: 0
      })
      .css('display', 'none')
      .appendTo('body');
  };

  $.fn.framejax = function(opts) {
    return this.each(function() {
      var el = $(this);
      if (el[0].tagName != 'FORM')
        throw new Error('all selectors must be form tags');

      var submit = function() {
        var id = '__framejax__' + lastId++;
        var iframe = createiFrame(id);

        iframe.on('load', function() {
          var results = $(this).contents().find('body').html();
          el.trigger('complete', results);
          //cleanup
          iframe.remove();
        });

        el.attr('target', id);
      };

      el.on('submit', submit);
      el.on('framejaxSubmit', submit);
    });
  };
}(window.jQuery);

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
