var Backbone, models, server, _;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
server = false;
if (typeof exports !== 'undefined') {
  _ = require('underscore')._;
  Backbone = require('backbone');
  models = exports;
  server = true;
} else {
  models = this.models = {};
  Backbone = this.Backbone;
}
/*
  Models
*/
models.ChatEntry = (function() {
  function ChatEntry() {
    ChatEntry.__super__.constructor.apply(this, arguments);
  }
  __extends(ChatEntry, Backbone.Model);
  return ChatEntry;
})();
models.ClientCountModel = (function() {
  function ClientCountModel() {
    ClientCountModel.__super__.constructor.apply(this, arguments);
  }
  __extends(ClientCountModel, Backbone.Model);
  ClientCountModel.prototype.defaults = {
    clients: 0
  };
  ClientCountModel.prototype.updateClients = function(c) {
    return this.set({
      clients: c
    });
  };
  return ClientCountModel;
})();
models.NodeChatModel = (function() {
  function NodeChatModel() {
    NodeChatModel.__super__.constructor.apply(this, arguments);
  }
  __extends(NodeChatModel, Backbone.Model);
  NodeChatModel.prototype.defaults = {
    clientId: 0
  };
  NodeChatModel.prototype.initialize = function() {
    return this.chats = new models.ChatCollection();
  };
  return NodeChatModel;
})();
/*
  Collections
*/
models.ChatCollection = (function() {
  function ChatCollection() {
    ChatCollection.__super__.constructor.apply(this, arguments);
  }
  __extends(ChatCollection, Backbone.Collection);
  ChatCollection.prototype.model = models.ChatEntry;
  return ChatCollection;
})();
/*
  Model import / export
*/
Backbone.Model.prototype.xport = function(opt) {
  var process, result, settings;
  result = {};
  settings = _({
    recurse: true
  }).extend(opt || {});
  process = function(target, source) {
    target.id = source.id || null;
    target.cid = source.cid || null;
    target.attrs = source.toJSON();
    return _.each(source, function(v, k) {
      if (settings.recurse) {
        if (k !== 'collection' && source[k] instanceof Backbone.Collection) {
          target.collections = target.collections || {};
          target.collections[k] = {
            models: [],
            id: source[k].id || null
          };
          return _.each(source[k].models, function(v, i) {
            return process(target.collections[k].models[i] = {}, v);
          });
        } else if (source[k] instanceof Backbone.Model) {
          target.models = target.models || {};
          return process(target.models[k] = {}, v);
        }
      }
    });
  };
  process(result, this);
  return JSON.stringify(result);
};
Backbone.Model.prototype.mport = function(data, silent) {
  var process;
  process = function(target, data) {
    target.id = data.id || null;
    target.set(data.attrs, {
      silent: silent
    });
    if (data.collections) {
      _.each(data.collections, function(c, name) {
        target[name].id = c.id;
        return _.each(c.models, function(modelData, i) {
          var o;
          o = target[name]._add({}, {
            silent: silent
          });
          return process(o, modelData);
        });
      });
    }
    if (data.models) {
      return _.each(data.models, function(modelData, name) {
        return process(target[name], modelData);
      });
    }
  };
  process(this, JSON.parse(data));
  return this;
};