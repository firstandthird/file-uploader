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
      zIndex: 2,
      dropZone: 'this',
      updateProgress: function(event) {}
    },

    init: function() {
      var self = this;

      this.supportsFileApi = (typeof window.FileReader !== 'undefined');

      this.el.css('cursor', 'pointer');

      this.setupFramejax();

      if(this.supportsFileApi) {
        this.setupFileApi();
      }
    },

    setupFramejax: function() {
      var self = this;

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

      form
        .framejax()
        .on('complete', function(e, results) {
          self.showComplete(results);
          self.el.trigger('complete', results);
        });
    },

    setupFileApi: function() {
      var self = this;
      if(this.dropZone === 'this') {
        this.dropZone = this.el;
      } else {
        this.dropZone = $(this.dropZone);
      }

      this.dropZone.bind('dragenter, dragover', function(event){
        event.stopPropagation();
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
        self.emit('over');
      });

      this.dropZone.bind('dragleave', function() {
        self.emit('out');
      });

      this.dropZone.bind('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();

        var file = event.originalEvent.dataTransfer.files[0];

        if(!self.checkType(file)) {
          //Probably some messaging here about filetype
          return;
        }

        self.upload(file);
      });
    },

    checkType: function(file) {
      for(var i = 0, c = this.allow.length; i < c; i++) {
        if(file.type.indexOf(this.allow[i]) !== -1) {
          return true;
        }
      }

      return false;
    },

    showProgress: function() {
      this.el.html(this.progressTemplate);
    },

    showComplete: function(data, xhrData, event) {
      var img = (this.processData) ? this.processData(data) : data;
      if (!img) {
        return;
      }
      this.el
        .html(this.completeTemplate)
        .find('img')
          .attr('src', img);
    },

    upload: function(file) {
      var formData = new FormData();

      formData.append('image', file);

      var self = this;

      var xhr = new XMLHttpRequest();

      this.showProgress();

      xhr.open('POST', this.action, true);
      xhr.upload.onprogress = this.updateProgress;
      xhr.onload = function(event) {
        self.showComplete(this.responseText, this, event);
        self.el.trigger('complete', this.responseText);
      };

      xhr.send(formData);
    }

  });
})(window.jQuery);
