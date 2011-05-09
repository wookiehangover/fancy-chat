/*
  requirements
*/var Backbone, activeClients, app, chatMessage, clientDisconnect, jade, models, nodeChatModel, rc, redis, socket, _;
app = require('express').createServer();
jade = require('jade');
socket = require('socket.io').listen(app);
_ = require('underscore')._;
Backbone = require('backbone');
redis = require('redis');
rc = redis.createClient();
models = require('./models/models');
/*
  settings
*/
app.set('view engine', 'jade');
app.set('view options', {
  layout: false
});
/*
  responses
*/
app.get('*.(js|css)', function(req, res) {
  return res.sendfile("./" + req.url);
});
app.get('/', function(req, res) {
  return res.render('index');
});
activeClients = 0;
nodeChatModel = new models.NodeChatModel();
/*
  data store
*/
rc.lrange('chatentries', -10, -1, function(err, data) {
  if (data) {
    _.each(data, function(jsonChat) {
      var chat;
      chat = new models.ChatEntry();
      chat.mport(jsonChat);
      return nodeChatModel.chats.add(chat);
    });
    return console.log("Revived " + nodeChatModel.chats.length + " chats");
  } else {
    return console.log("No data returned for key");
  }
});
/*
  socket connections
*/
chatMessage = function(client, socket, msg) {
  var chat;
  chat = new models.ChatEntry();
  chat.mport(msg);
  return rc.incr('next.chatentry.id', function(err, newId) {
    chat.set({
      id: newId
    });
    nodeChatModel.chats.add(chat);
    console.log("(" + client.sessionId + ") " + (chat.get('id')) + " " + (chat.get('name')) + ": " + (chat.get('text')));
    rc.rpush('chatentries', chat.xport(), redis.print);
    rc.bgsave();
    return socket.broadcast({
      event: 'chat',
      data: chat.xport()
    });
  });
};
clientDisconnect = function(client) {
  activeClients -= 1;
  return client.broadcast({
    clients: activeClients
  });
};
socket.on('connection', function(client) {
  client.on('disconnect', function() {
    return clientDisconnect(client);
  });
  client.on('message', function(msg) {
    return chatMessage(client, socket, msg);
  });
  client.send({
    event: 'inital',
    data: nodeChatModel.xport()
  });
  return socket.broadcast({
    event: 'update',
    clients: activeClients
  });
});
app.listen(8000);