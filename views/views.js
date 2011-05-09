var ChatView, ClientCountView, NodeChatView;
ChatView = Backbone.View.extend({
  tagName: 'li',
  initialize: function(o) {
    _.bindAll(this, 'render');
    this.model.bind('all', this.render);
  },
  render: function() {
    $(this.el).html("" + (this.model.get('name')) + " : " + (this.model.escape('text')));
    return this;
  }
});
ClientCountView = Backbone.View.extend({
  initialize: function(o) {
    _.bindAll(this, 'render');
    this.model.bind('all', this.render);
  },
  render: function() {
    this.el.html(this.model.get('clients'));
    return this;
  }
});
NodeChatView = Backbone.View.extend({
  initialize: function(o) {
    this.model.chats.bind('add', this.addChat);
    this.socket = o.socket;
    this.clientCountView = new ClientCountView({
      model: new models.ClientCountModel(),
      el: $('#client_count')
    });
  },
  events: {
    "submit #messageForm": "sendMessage"
  },
  addChat: function(chat) {
    var view;
    view = new ChatView({
      model: chat
    });
    $('#chat_list').append(view.render().el);
  },
  msgReceived: function(msg) {
    var newChatEntry;
    switch (msg.event) {
      case 'initial':
        return this.model.mport(msg.data);
      case 'chat':
        newChatEntry = new models.ChatEntry();
        newChatEntry.mport(msg.data);
        return this.model.chats.add(newChatEntry);
      case 'update':
        return this.clientCountView.model.updateClients(msg.clients);
    }
  },
  sendMessage: function() {
    var $input, $name, chatEntry;
    $input = $('input[name=message]');
    $name = $('input[name=user_name]');
    chatEntry = new models.ChatEntry({
      name: $name.val(),
      text: $input.val()
    });
    this.socket.send(chatEntry.xport());
    return $input.val('');
  }
});