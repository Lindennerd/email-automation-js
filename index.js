var ImapClient = require('emailjs-imap-client');
var fs = require('fs');

var client = new ImapClient('imap.powerbrasil.com.br', 143, {
    auth: {
        user: 'luiz.paulo@powerbrasil.com.br',
        pass: 'power100'
    }
});

client.onerror = function (err) {
    console.log(err);
};

client.connect().then(function () {
    client.selectMailbox('INBOX').then(function (mailbox) {

        getLastProcessed(function (dbLastUid) {
            var lastUid = dbLastUid || mailbox.uidNext - 50;
            client.listMessages('INBOX', lastUid + ':*', ['uid', 'flags', 'body[]', 'envelope', 'bodystructure'], { byUid: true }).then(function (messages) {
                for (var index in messages) {
                    var message = messages[index];
                    var cpNewsLetter = message.envelope.from.find(function (f) {
                        return f.address === 'mailout@maillist.codeproject.com';
                    });
                    if (cpNewsLetter) {
                        setLastProcessed(message.uid);
                        // deal with the body
                    }
                }
            })
        });

    }).then(function () {
        client.logout();
    });
})

function getLastProcessed(cb) {
    fs.readFile(".\\control.txt", 'utf-8', function (err, data) {
        cb(data);
    });
}

function setLastProcessed(uid) {
    var stream = fs.createWriteStream(".\\control.txt");
    stream.once('open', function (fd) {
        stream.write(uid + '');
        stream.end();
    })
}