var ImapClient = require('imap-client');
var mailreader = require('mailreader');

var imap = new ImapClient({
    port: 143,
    host: 'imap.powerbrasil.com.br',
    secure: false,
    ignoreTLS: false,
    requireTLS: false,
    auth: {
        user: 'luiz.paulo@powerbrasil.com.br',
        pass: 'power100',
    },

    maxUpdateSize: 20
});

imap.login().then(function() {
    console.log('logged');
    imap.listMessages({
        path: 'INBOX',
        firstUid: '64605',
        lastUid: '*'
    }).then(function(messages) {
        //console.log(messages);
        for (var index in messages) {
            var email = messages[index];
            if (email.subject.includes('Typeform')) {
                mailreader.parse(email, function(err, bodyParts) {
                    console.log(bodyParts[0].content[0]);
                });
            }
        }

    }).then(function() {
        imap.logout();
    })
});

// ref https://github.com/whiteout-io/imap-client
// ref https://www.npmjs.com/package/mailreader