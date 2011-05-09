NodeChatController =
  init: ->
    @socket = mysocket = new io.Socket null, { port: 8000 }

    @model = new models.NodeChatModel()

    @view = view = new NodeChatView
      model: @model
      socket: @socket
      el: $('#content')

    @socket.on 'message', ( msg ) ->
      view.msgReceived( msg )

    @socket.connect()

    @view.render()

    return @

$( document ).ready ->
  window.app = NodeChatController.init( {} )


