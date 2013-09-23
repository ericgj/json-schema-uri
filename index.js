
module.exports = Uri;

var PARTS = ['protocol','authority','host','hostname','port','pathname','search','hash']

// util
var forEach = Array.forEach || function(fn){
  for (var i=0;i<this.length;++i){
    fn(this[i]);
  }
}


function Uri(str){
  if (!(this instanceof Uri)) return new Uri(str);
  this.parse(str || '');
  return this;
}

// parse() and canonical() are adapted from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

Uri.prototype.parse = function(str){
  var m = String(str).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
  // authority = '//' + user + ':' + pass '@' + hostname + ':' port
  this.reset();
  if (m) {
    this._protocol  = m[1] || '';
    this._authority = m[2] || '';
    this._host      = m[3] || '';
    this._hostname  = m[4] || '';
    this._port      = m[5] || '';
    this._pathname  = m[6] || '';
    this._search    = m[7] || '';
    this._hash      = m[8] || '';
  }
}


forEach.call(PARTS, function(prop){
  Uri.prototype[prop] = function(str){ 
    if (arguments.length == 1){ this['_'+prop] = String(str || ''); }
    else    { return this['_'+prop]; }
  }
})

Uri.prototype.reset = function(){
  for (var i=0;i<PARTS.length;++i){
    var prop = PARTS[i]
    this['_'+prop] = '' ;
  }
}

Uri.prototype.href = 
Uri.prototype.toString = function(){
  return this.protocol() + 
         this.authority() + 
         this.pathname() +
         this.search() + 
         this.hash()
}

Uri.prototype.clone = function(){
  var uri = new this.constructor();
  for (var i=0;i<PARTS.length;++i){
    var part = PARTS[i]
    uri[part](this[part]());
  }
  return uri;
}

// URI minus the query string and hash part
Uri.prototype.base = function(){
  var uri = this.clone();
  uri.search(''); uri.hash('');
  return uri;
}

Uri.prototype.join = function(uri){
  return new this.constructor(this.canonical(uri.toString()));
}

// fragment == hash
Uri.prototype.fragment = function(str){ 
  return this.hash(str); 
}

Uri.prototype.isFragment = function(){
  return !!this.hash() && 
         !this.protocol() && !this.authority() &&
         !this.host() && !this.pathname() &&
         !this.search();
}        

Uri.prototype.fragmentPush = function(str){
  var path = this._hash
    , parts = path.split('/')
  if ('' == parts[0]) parts[0] = '#';
  parts.push(str);
  this._hash = parts.join('/');
  return str;
}

Uri.prototype.fragmentPop = function(){
  var path = this._hash
    , parts = path.split('/')
  if ('#' == parts[0]) parts.shift();
  if (''  == parts[0]) parts.shift();
  var last = parts.pop() || ''
  parts.unshift('#');
  this._hash = parts.join('/');
  return last;
}

Uri.prototype.fragmentUnshift = function(str){
  var path = this._hash
    , parts = path.split('/')
  if ('#' == parts[0]) parts.shift();
  if (''  == parts[0]) parts.shift();
  parts.unshift(str);
  parts.unshift('#');
  this._hash = parts.join('/');
  return parts.length;
}

Uri.prototype.fragmentShift = function(){
  var path = this._hash
    , parts = path.split('/')
  if ('#' == parts[0]) parts.shift();
  if (''  == parts[0]) parts.shift();
  var first = parts.shift()
  parts.unshift('#');
  this._hash = parts.join('/');
  return first;
}


Uri.prototype.canonical = function(href) {// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
		});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = new Uri(href);
	var base = this;

	return (href.protocol() || base.protocol()) +
		(href.protocol() || href.authority() ? href.authority() : base.authority()) +
		removeDotSegments(href.protocol() || href.authority() || href.pathname().charAt(0) === '/' ? href.pathname() : (href.pathname() ? ((base.authority() && !base.pathname() ? '/' : '') + base.pathname().slice(0, base.pathname().lastIndexOf('/') + 1) + href.pathname()) : base.pathname() )) +
		(href.protocol() || href.authority() || href.pathname() ? href.search() : (href.search() || base.search() )) +
		href.hash();
}



