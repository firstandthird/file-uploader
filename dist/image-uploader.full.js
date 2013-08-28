/*!
 * image-uploader - jQuery image upload plugin
 * v0.4.0
 * https://github.com/jgallen23/image-uploader/
 * copyright Greg Allen 2013
 * MIT License
*/
/*!
 * fidel - a ui view controller
 * v2.2.3
 * https://github.com/jgallen23/fidel
 * copyright Greg Allen 2013
 * MIT License
*/
(function(w, $) {
  var _id = 0;
  var Fidel = function(obj) {
    this.obj = obj;
  };

  Fidel.prototype.__init = function(options) {
    $.extend(this, this.obj);
    this.id = _id++;
    this.obj.defaults = this.obj.defaults || {};
    $.extend(this, this.obj.defaults, options);
    $('body').trigger('FidelPreInit', this);
    this.setElement(this.el || $('<div/>'));
    if (this.init) {
      this.init();
    }
    $('body').trigger('FidelPostInit', this);
  };
  Fidel.prototype.eventSplitter = /^(\w+)\s*(.*)$/;

  Fidel.prototype.setElement = function(el) {
    this.el = el;
    this.getElements();
    this.delegateEvents();
    this.dataElements();
    this.delegateActions();
  };

  Fidel.prototype.find = function(selector) {
    return this.el.find(selector);
  };

  Fidel.prototype.proxy = function(func) {
    return $.proxy(func, this);
  };

  Fidel.prototype.getElements = function() {
    if (!this.elements)
      return;

    for (var selector in this.elements) {
      var elemName = this.elements[selector];
      this[elemName] = this.find(selector);
    }
  };

  Fidel.prototype.dataElements = function() {
    var self = this;
    this.find('[data-element]').each(function(index, item) {
      var el = $(item);
      var name = el.data('element');
      self[name] = el;
    });
  };

  Fidel.prototype.delegateEvents = function() {
    var self = this;
    if (!this.events)
      return;
    for (var key in this.events) {
      var methodName = this.events[key];
      var match = key.match(this.eventSplitter);
      var eventName = match[1], selector = match[2];

      var method = this.proxy(this[methodName]);

      if (selector === '') {
        this.el.on(eventName, method);
      } else {
        if (this[selector] && typeof this[selector] != 'function') {
          this[selector].on(eventName, method);
        } else {
          this.el.on(eventName, selector, method);
        }
      }
    }
  };

  Fidel.prototype.delegateActions = function() {
    var self = this;
    self.el.on('click', '[data-action]', function(e) {
      var el = $(this);
      var action = el.attr('data-action');
      if (self[action]) {
        self[action](e, el);
      }
    });
  };

  Fidel.prototype.on = function(eventName, cb) {
    this.el.on(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.one = function(eventName, cb) {
    this.el.one(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.emit = function(eventName, data, namespaced) {
    var ns = (namespaced) ? '.fidel'+this.id : '';
    this.el.trigger(eventName+ns, data);
  };

  Fidel.prototype.hide = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].hide();
      }
    }
    this.el.hide();
  };
  Fidel.prototype.show = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].show();
      }
    }
    this.el.show();
  };

  Fidel.prototype.destroy = function() {
    this.el.empty();
    this.emit('destroy');
    this.el.unbind('.fidel'+this.id);
  };

  Fidel.declare = function(obj) {
    var FidelModule = function(el, options) {
      this.__init(el, options);
    };
    FidelModule.prototype = new Fidel(obj);
    return FidelModule;
  };

  //for plugins
  Fidel.onPreInit = function(fn) {
    $('body').on('FidelPreInit', function(e, obj) {
      fn.call(obj);
    });
  };
  Fidel.onPostInit = function(fn) {
    $('body').on('FidelPostInit', function(e, obj) {
      fn.call(obj);
    });
  };
  w.Fidel = Fidel;
})(window, window.jQuery || window.Zepto);

(function($) {
  $.declare = function(name, obj) {

    $.fn[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      var options = args.shift();
      var methodValue;
      var els;

      els = this.each(function() {
        var $this = $(this);

        var data = $this.data(name);

        if (!data) {
          var View = Fidel.declare(obj);
          var opts = $.extend({}, options, { el: $this });
          data = new View(opts);
          $this.data(name, data); 
        }
        if (typeof options === 'string') {
          methodValue = data[options].apply(data, args);
        }
      });

      return (typeof methodValue !== 'undefined') ? methodValue : els;
    };

    $.fn[name].defaults = obj.defaults || {};

  };

  $.Fidel = window.Fidel;

})(jQuery);
/*!
 * framejax - jQuery plugin to submit multipart forms through an iframe
 * v0.2.2
 * https://github.com/jgallen23/framejax/
 * copyright Greg Allen 2013
 * MIT License
*/
(function($) {
  var lastId = 0;
  var createiFrame = function(id) {
    return $('<iframe name="'+id+'" />')
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
})(window.jQuery);

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
