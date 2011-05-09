###
  requirements
###
app       = require('express').createServer()
jade      = require('jade')
socket    = require('socket.io').listen app
_         = require('underscore')._
Backbone  = require('backbone')
redis     = require('redis')
rc        = redis.createClient()
models    = require('./models/models')

###
  settings
###
app.set 'view engine', 'jade'
app.set 'view options', { layout: false }

###
  responses
###
app.get '*.(js|css)', ( req, res ) ->
  res.sendfile "./#{req.url}"

app.get '/', ( req, res ) ->
  res.render 'index'

activeClients = 0
nodeChatModel = new models.NodeChatModel()

###
  data store
###
rc.lrange 'chatentries', -10, -1, ( err, data ) ->
  if data
    _.each data, ( jsonChat ) ->
      chat = new models.ChatEntry()
      chat.mport jsonChat
      nodeChatModel.chats.add chat

    console.log "Revived #{nodeChatModel.chats.length} chats"

  else
    console.log "No data returned for key"


###
  socket connections
###

chatMessage = ( client, socket, msg ) ->
  chat = new models.ChatEntry()
  chat.mport msg

  rc.incr 'next.chatentry.id', ( err, newId ) ->
    chat.set
      id: newId

    nodeChatModel.chats.add chat

    console.log "(#{client.sessionId}) #{chat.get('id')} #{chat.get('name')}: #{chat.get('text')}"

    rc.rpush('chatentries', chat.xport(), redis.print)
    rc.bgsave()

    socket.broadcast
      event: 'chat'
      data: chat.xport()

clientDisconnect = ( client ) ->
  activeClients -= 1
  client.broadcast
    clients: activeClients


socket.on 'connection', ( client ) ->
  client.on 'disconnect', () ->
    clientDisconnect client

  client.on 'message', ( msg ) ->
    chatMessage client, socket, msg

  client.send
    event: 'inital'
    data: nodeChatModel.xport()

  socket.broadcast
    event: 'update'
    clients: activeClients


app.listen 8000
