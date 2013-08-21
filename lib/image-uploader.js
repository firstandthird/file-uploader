(function($) {

  $.declare('imageUploader', {
    defaults: {
      action: window.location.href,
      method: 'POST',
      postKey: 'image',
      progressTemplate: '<div class="progress">Uploading...</div>',
      completeTemplate: '<img/>',
      allow: ['jpg', 'png', 'bmp', 'gif', 'jpeg'],
      processData: null,
      zIndex: 2
    },

    init: function() {
      var self = this;

      this.el.css('cursor', 'pointer');

      var form = $('<form/>')
        .attr({
          action: this.action,
          method: this.method,
          enctype: 'multipart/form-data'
        })
        .appendTo('body');

      var input = $('<input/>')
        .attr({
          name: this.postKey,
          type: 'file'
        })
        .css({
          opacity: '0',
          cursor: 'pointer',
          position: 'absolute',
          zIndex: this.zIndex
        })
        .on('change', function(e) {
          var filename = e.target.value;
          var ext = filename.split('.').pop().toLowerCase();
          if ($.inArray(ext, self.allow) == -1) {
            alert('Please select a photo with a ' + self.allow.join(', ') + ' extension');
            return;
          }

          self.el.trigger('fileSelect');
          self.showProgress();
          form.submit();
        })
        .appendTo(form);

      form
        .framejax()
        .on('complete', function(e, results) {
          self.showComplete(results);
          self.el.trigger('complete', results);
        });

      this.el.on('mousemove', function(e) {
        var h = input.height();
        var w = input.width();
        if (typeof e.pageY == 'undefined' && typeof e.clientX == 'number' && document.documentElement) {
          e.pageX = e.clientX + document.documentElement.scrollLeft;
          e.pageY = e.clientY + document.documentElement.scrollTop;
        }
        input.css({
          top: e.pageY - (h / 2),
          left: e.pageX - (w - 30)
        });
      });
    },

    showProgress: function() {
      this.el.html(this.progressTemplate);
    },

    showComplete: function(data) {
      var img = (this.processData) ? this.processData(data) : data;
      if (!img) {
        return;
      }
      this.el
        .html(this.completeTemplate)
        .find('img')
          .attr('src', img);
    }

  });
})(window.jQuery);
