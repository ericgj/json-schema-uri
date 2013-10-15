var assert = require('assert')
  , Uri = require('json-schema-uri')

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

    it('should parse no hash', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value';
      var act = Uri(subject);
      assert(act.hash()=='');
    })

    it('should parse if given a URI object', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      subject = Uri(subject);
      var act = Uri(subject);
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
    })

    it('should copy values', function(){
      var uri = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      var subject = Uri(uri);
      var act = subject.clone();
      act.hash('');
      assert(subject.toString() == uri);
      assert(subject.fragment() == '#hash/path');
    })

  })

  describe('base', function(){

    it('should clone itself minus search and hash parts', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      subject = Uri(subject);
      var act = subject.base();
      console.log("base: %s", act);
      assert(act == 'http://example.com:8080/some/path');
    });

    it('should not alter original', function(){
      var uri = 'http://example.com:8080/some/path?query=string;another=value#hash/path';
      var subject = Uri(uri);
      var act = subject.base();
      assert(subject.fragment() == '#hash/path');
    });

  })

  describe('join', function(){

    it('should canonical join with a string', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value';
      subject = Uri(subject);
      var another = 'http://example.com:8808/another/rainbow#/fragment/path';
      var act = subject.join(another);
      console.log("join: %o", act);
      assert(act.toString() == another);
    })

    it('should canonical join with another URI', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value';
      subject = Uri(subject);
      var another = 'http://example.com:8808/another/rainbow#/fragment/path';
      another = Uri(another);
      var act = subject.join(another);
      console.log("join: %o", act);
      assert(act.toString() == another.toString());
    })

    it('should canonical join with a relative path', function(){
      var subject = 'http://example.com:8080/some/path?query=string;another=value';
      subject = Uri(subject);
      var another = 'another/path';
      var act = subject.join(another);
      console.log("join: %o", act);
      assert(act.toString() == 'http://example.com:8080/some/another/path');
    })


    it('should canonical join a blank URI with another', function(){
      var subject = '';
      subject = Uri(subject);
      var another = 'http://example.com:8080/some/path#hash';
      var act = subject.join(another);
      console.log("join: %o", act);
      assert(act.toString() == 'http://example.com:8080/some/path#hash');
    })

  })

  describe('isFragment', function(){

    it('should return true if only fragment', function(){
      var subject = Uri('#/hash/path');
      assert(subject.isFragment());
    })

    it('should return true if root fragment', function(){
      var subject = Uri('#');
      assert(subject.isFragment());
    })

    it('should not return true if more than a fragment', function(){
      var subject = Uri('/one/two#/three/four');
      assert(false == subject.isFragment());
    })
  
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

