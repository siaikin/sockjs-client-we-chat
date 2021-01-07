'use strict';

var urlUtils = require('../utils/url')
  , inherits = require('inherits')
  , EventEmitter = require('events').EventEmitter
;

var debug = function() {};
if (process.env.NODE_ENV !== 'production') {
  debug = require('debug')('sockjs-client:websocket-we-chat');
}

function WeChatWebsocketTransport(transUrl, ignore, options) {
  if (!WeChatWebsocketTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }

  EventEmitter.call(this);
  var self = this;
  var url = urlUtils.addPath(transUrl, '/websocket');
  if (url.slice(0, 5) === 'https') {
    url = 'wss' + url.slice(5);
  } else {
    url = 'ws' + url.slice(4);
  }
  this.url = url;

  this.ws = new WebsocketWeChat(wx.connectSocket({url: this.url}));
  this.ws.onmessage = function(e) {
    debug('message event', e.data);
    self.emit('message', e.data);
  };
  this.ws.onclose = function(e) {
    debug('close event', e.code, e.reason);
    self.emit('close', e.code, e.reason);
    self._cleanup();
  };
  this.ws.onerror = function(e) {
    debug('error event', e);
    self.emit('close', 1006, 'WebSocket connection broken');
    self._cleanup();
  };
}

inherits(WeChatWebsocketTransport, EventEmitter);

WeChatWebsocketTransport.prototype.send = function(data) {
  var msg = '[' + data + ']';
  debug('send', msg);
  this.ws.send(msg);
};

WeChatWebsocketTransport.prototype.close = function(code, reason) {
  debug('close');
  var ws = this.ws;
  this._cleanup();
  if (ws) {
    ws.close(code, reason);
  }
};

WeChatWebsocketTransport.prototype._cleanup = function() {
  debug('_cleanup');
  var ws = this.ws;
  if (ws) {
    ws.onmessage = ws.onclose = ws.onerror = null;
  }
  this.ws = null;
  this.removeAllListeners();
};

WeChatWebsocketTransport.enabled = function() {
  debug('enabled');
  return typeof wx !== 'undefined';
};
WeChatWebsocketTransport.transportName = 'websocket-we-chat';

// In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.
WeChatWebsocketTransport.roundTrips = 2;

module.exports = WeChatWebsocketTransport;


/*************************************************************/

function WebsocketWeChat(socketTask) {
  var that = this;
  this.socketTask = socketTask;

  this.socketTask.onOpen(function (e) { that.onopen && that.onopen(e); })
  this.socketTask.onClose(function (e) { that.onclose && that.onclose(e); })
  this.socketTask.onError(function (e) { that.onerror && that.onerror(e); })
  this.socketTask.onMessage(function (e) { that.onmessage && that.onmessage(e); })
}

WebsocketWeChat.prototype.send = function (data) {
  return this.socketTask.send({data: data});
}

WebsocketWeChat.prototype.close = function (code, reason) {
  return this.socketTask.close({code: code, reason: reason});
}
