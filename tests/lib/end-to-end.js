'use strict';

var expect = require('expect.js')
  , testUtils = require('./test-utils')
  ;

describe('End to End', function () {
  this.timeout(10000);

  describe('Connection Errors', function () {
    it('invalid url 404', function (done) {
      var sjs = testUtils.newSockJs('/invalid_url', 'jsonp-polling');
      expect(sjs).to.be.ok();
      sjs.onopen = sjs.onmessage = function () {
        expect().fail('Open/Message event should not fire for an invalid url');
      };
      sjs.onclose = function (e) {
        expect(e.code).to.equal(1002);
        expect(e.reason).to.equal('Cannot connect to server');
        expect(e.wasClean).to.equal(false);
        done();
      };
    });

    it('invalid url port', function (done) {
      var badUrl;
      if (global.location) {
        badUrl = global.location.protocol + '//' + global.location.hostname + ':1079';
      } else {
        badUrl = 'http://localhost:1079';
      }

      var sjs = testUtils.newSockJs(badUrl, 'jsonp-polling');
      expect(sjs).to.be.ok();
      sjs.onopen = sjs.onmessage = function () {
        expect().fail('Open/Message event should not fire for an invalid port');
      };
      sjs.onclose = function (e) {
        expect(e.code).to.equal(1002);
        expect(e.reason).to.equal('Cannot connect to server');
        expect(e.wasClean).to.equal(false);
        done();
      };
    });

    it('disabled websocket test', function (done) {
      var sjs = testUtils.newSockJs('/disabled_websocket_echo', 'websocket');
      expect(sjs).to.be.ok();
      sjs.onopen = sjs.onmessage = function () {
        expect().fail('Open/Message event should not fire for disabled websockets');
      };
      sjs.onclose = function (e) {
        expect(e.code).to.equal(2000);
        expect(e.reason).to.equal('All transports failed');
        expect(e.wasClean).to.equal(false);
        done();
      };
    });

    it('close on close', function (done) {
      var sjs = testUtils.newSockJs('/close');
      expect(sjs).to.be.ok();
      sjs.onopen = function () {
        expect(true).to.be.ok();
      };
      sjs.onmessage = function () {
        expect().fail('Message should not be emitted');
      };
      sjs.onclose = function (e) {
        expect(e.code).to.equal(3000);
        expect(e.reason).to.equal('Go away!');
        expect(e.wasClean).to.equal(true);
        sjs.onclose = function () {
          expect().fail();
        };
        sjs.close();
        setTimeout(function () {
          done();
        }, 10);
      };
    });
  });
});