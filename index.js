var ImapClient = require('emailjs-imap-client');

var client = new ImapClient('imap.powerbrasil.com.br', 143, {
    auth: {
        user: 'luiz.paulo@powerbrasil.com.br',
        pass: 'power100'
    }
});

client.onerror = function(err) {
    console.log(err);
};

client.connect().then(function(){
    client.selectMailbox('INBOX').then(function(mailbox) {
        
        client.listMessages('INBOX', '1:10', ['uid', 'flags', 'body[]', 'envelope', 'bodystructure']).then(function(messages){
            for(var index in messages){
                var message = messages[index];
                console.log('Message from '+message.envelope.from.join(', ') + ' sended to '+message.envelope.to.join(', '));
            }
        })


    }).then(function() {
        client.logout();
    });
})