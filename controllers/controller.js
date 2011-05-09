var NodeChatController;
NodeChatController = {
  init: function() {
    var mysocket, view;
    this.socket = mysocket = new io.Socket(null, {
      port: 8000
    });
    this.model = new models.NodeChatModel();
    this.view = view = new NodeChatView({
      model: this.model,
      socket: this.socket,
      el: $('#content')
    });
    this.socket.on('message', function(msg) {
      return view.msgReceived(msg);
    });
    this.socket.connect();
    this.view.render();
    return this;
  }
};
$(document).ready(function() {
  return window.app = NodeChatController.init({});
});