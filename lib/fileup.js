var FileUploader = function(el) {
  this.el = el;
  this.addForm();
  this.onStart = function() {};
  this.onComplete = function() {};
  addEvent(el, 'mousemove', this.proxy(this.overlayInput));
  return this;
};

FileUploader.prototype.action = function(url) {
  this.form.action = url;
  return this;
};

FileUploader.prototype.start = function(f) {
  this.onStart = f;
  return this;
};

FileUploader.prototype.complete = function(f) {
  this.onComplete = f;
  return this;
};

FileUploader.prototype.proxy = function(func) {
  var obj = this;
  return(function(){ 
    if (!func) return;
    return func.apply(obj, arguments); 
  });
};

FileUploader.prototype.overlayInput = function(e) {

  if (typeof e == 'undefined') e = window.event;
  if (typeof e.pageY == 'undefined' &&  typeof e.clientX == 'number' && document.documentElement) {
    e.pageX = e.clientX + document.documentElement.scrollLeft;
    e.pageY = e.clientY + document.documentElement.scrollTop;
  }

  var ox = oy = 0;
  var elem = this;
  if (elem.offsetParent) {
    ox = elem.offsetLeft;
    oy = elem.offsetTop;
    while (elem = elem.offsetParent) {
      ox += elem.offsetLeft;
      oy += elem.offsetTop;
    };
  };

  var x = e.pageX - ox;
  var y = e.pageY - oy;
  var w = this.input.offsetWidth;
  var h = this.input.offsetHeight;

  this.input.style.top   = y - (h / 2)  + 'px';
  this.input.style.left  = x - (w - 30) + 'px';
};

FileUploader.prototype.addForm = function() {
  this.form = document.createElement('form');
  this.form.action = window.location.href;
  this.form.method = "POST";
  this.form.enctype = "multipart/form-data";

  this.input = document.createElement('input');
  this.input.style.position = "absolute";
  this.input.name = 'file';
  this.input.type = 'file';
  //TODO: filter for ie
  this.input.style.opacity = "0";
  this.input.style.cursor = "pointer";

  addEvent(this.input, 'change', this.proxy(this.fileSelected));
  this.form.appendChild(this.input);

  document.body.appendChild(this.form);
  this.submit = framejax(this.form, this.proxy(this._uploadComplete));

};

FileUploader.prototype._uploadComplete = function(file) {
  this.onComplete(file);
};

FileUploader.prototype.fileSelected = function() {
  this.onStart();
  this.submit();
};

var fileUp = function(triggerNode) {
  return new FileUploader(triggerNode);
};
