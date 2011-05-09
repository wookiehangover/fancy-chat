ChatView = Backbone.View.extend
  tagName: 'li'

  initialize: ( o ) ->
    _.bindAll @, 'render'
    @model.bind 'all', @render
    return

  render: ->
    $( @el ).html "#{@model.get('name')} : #{@model.escape('text')}"
    return @


ClientCountView = Backbone.View.extend
  initialize: ( o ) ->
    _.bindAll @, 'render'
    @model.bind 'all', @render
    return

  render: ->
    @el.html @model.get( 'clients' )
    return @


NodeChatView = Backbone.View.extend
  initialize: ( o ) ->
    @model.chats.bind 'add', @addChat

    @socket = o.socket

    @clientCountView = new ClientCountView
      model: new models.ClientCountModel()
      el: $('#client_count')

    return

  events:
    "submit #messageForm": "sendMessage"

  addChat: ( chat ) ->
    view = new ChatView
      model: chat

    $('#chat_list').append( view.render().el )
    return

  msgReceived: ( msg ) ->
    switch msg.event
      when 'initial'
        @model.mport( msg.data )

      when 'chat'
        newChatEntry = new models.ChatEntry()
        newChatEntry.mport( msg.data )
        @model.chats.add( newChatEntry )

      when 'update'
        @clientCountView.model.updateClients( msg.clients )

  sendMessage: ->
    $input = $('input[name=message]')
    $name = $('input[name=user_name]')

    chatEntry = new models.ChatEntry
      name: $name.val()
      text: $input.val()

    @socket.send( chatEntry.xport() )

    $input.val('')

