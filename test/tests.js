var assert = require('timoxley-assert')
  , Uri = require('json-schema-uri')


//var PARTS = ['protocol','authority','host','hostname','port','pathname','search','hash']

///////////////////////////////////

describe('json-schema-uri', function(){
  describe('parse', function(){

    it('should parse', function(){ 
      var subject = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      var act = Uri(subject);
      console.log("parse: %o", act);
      assert(act.protocol()=='http:');
      assert(act.authority()=='//example.com:8080');
      assert(act.host()=='example.com:8080');
      assert(act.hostname()=='example.com');
      assert(act.port()=='8080');
      assert(act.pathname()=='/some/path');
      assert(act.search()=='?query=string;another=value');
      assert(act.hash()=='#hash/path');
    })
  })

  describe('clone', function(){

    it('should clone', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      subject = Uri(subject);
      var act = subject.clone();
      assert(subject.toString() == act.toString());
    });

  })

  describe('base', function(){

    it('should clone itself minus search and hash parts', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      subject = Uri(subject);
      var act = subject.base();
      console.log("base: %o", act);
      assert(act.toString() == 'http://example.com:8080/some/path');
    });

  })

  describe('fragment part stack operations', function(){

    it('should unshift onto fragment uri', function(){
      var subject = '#/one/two'
      subject = Uri(subject);
      subject.fragmentUnshift('three');
      console.log('fragment: %o', subject);
      assert(subject.toString() == '#/three/one/two');
    })

    it('should unshift onto relative path uri', function(){
      var subject = '/one/two#'
      subject = Uri(subject);
      subject.fragmentUnshift('three');
      assert(subject.toString() == '/one/two#/three');
    })

    it('should unshift onto root fragment uri', function(){
      var subject = Uri('#');
      subject.fragmentUnshift('one');
      assert(subject.toString() == '#/one');
    })

    it('should unshift onto empty fragment uri', function(){
      var subject = Uri('/one/two');
      subject.fragmentUnshift('three');
      assert(subject.toString() == '/one/two#/three');
    })

    it('should shift fragment uri', function(){
      var subject = '#/one/two'
      subject = Uri(subject);
      subject.fragmentShift();
      assert(subject.toString() == '#/two');
    })

    it('should shift root fragment uri', function(){
      var subject = Uri('#');
      subject.fragmentShift();
      assert(subject.toString() == '#');
    })

    it('should shift empty fragment uri', function(){
      var subject = Uri('/one/two');
      subject.fragmentShift();
      assert(subject.toString() == '/one/two#');
    })

    it('should push onto fragment uri', function(){
      var subject = '#/one/two'
      subject = Uri(subject);
      subject.fragmentPush('three');
      assert(subject.toString() == '#/one/two/three');
    })

    it('should push onto relative path uri', function(){
      var subject = '/one/two#'
      subject = Uri(subject);
      subject.fragmentPush('three');
      assert(subject.toString() == '/one/two#/three');
    })

    it('should push onto root fragment uri', function(){
      var subject = Uri('#');
      subject.fragmentPush('one');
      assert(subject.toString() == '#/one');
    })

    it('should push onto empty fragment uri', function(){
      var subject = Uri('/one/two');
      subject.fragmentPush('three');
      assert(subject.toString() == '/one/two#/three');
    })

    it('should pop fragment uri', function(){
      var subject = '#/one/two'
      subject = Uri(subject);
      subject.fragmentPop();
      assert(subject.toString() == '#/one');
    })

    it('should pop root fragment uri', function(){
      var subject = Uri('#');
      var pop = subject.fragmentPop();
      assert(pop == '');
      assert(subject.toString() == '#');
    })

    it('should pop empty fragment uri', function(){
      var subject = Uri('/one/two');
      var pop = subject.fragmentPop();
      assert(pop == '');
      assert(subject.toString() == '/one/two#');
    })

  })
})

