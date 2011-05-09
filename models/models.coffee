server = false

if typeof exports isnt 'undefined'

  _ = require('underscore')._
  Backbone = require('backbone')

  models = exports
  server = true

else
  models = @models = {}
  Backbone = @Backbone

###
  Models
###
class models.ChatEntry extends Backbone.Model

class models.ClientCountModel extends Backbone.Model
  defaults:
    clients: 0

  updateClients: ( c ) ->
    @set { clients: c }

class models.NodeChatModel extends Backbone.Model
  defaults:
    clientId: 0

  initialize: () ->
    @chats = new models.ChatCollection()

###
  Collections
###
class models.ChatCollection extends Backbone.Collection
  model: models.ChatEntry

###
  Model import / export
###
Backbone.Model.prototype.xport = ( opt ) ->
  result = {}

  settings = _({ recurse: true }).extend( opt || {} )

  process = ( target, source ) ->
    target.id = source.id || null
    target.cid = source.cid || null
    target.attrs = source.toJSON()

    _.each source, ( v, k ) ->
      if settings.recurse

        if k isnt 'collection' && source[k] instanceof Backbone.Collection
          target.collections = target.collections || {}

          target.collections[k] = {
            models: []
            id: source[k].id || null
          }

          _.each source[k].models, ( v, i ) ->
            process( target.collections[k].models[i] = {}, v )

        else if source[k] instanceof Backbone.Model
          target.models = target.models || {}
          process( target.models[k] = {}, v )

  process( result, @ )

  JSON.stringify( result )

Backbone.Model.prototype.mport = ( data, silent ) ->
  process = ( target, data ) ->
    target.id = data.id || null
    target.set( data.attrs, { silent: silent })

    if data.collections

      _.each data.collections, ( c, name ) ->
        target[name].id = c.id

        _.each c.models, ( modelData, i ) ->
          o = target[name]._add({}, { silent: silent })
          process( o, modelData )

    if data.models

      _.each data.models, ( modelData, name ) ->
        process( target[name], modelData )


  process( @, JSON.parse( data ) )

  return @
