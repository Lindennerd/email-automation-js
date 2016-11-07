var ImapClient = require('imap-client');
var mailreader = require('mailreader');

var imap = new ImapClient({
    port: 993,
    host: 'imap.gmail.com',
    secure: true,
    ignoreTLS: false,
    requireTLS: true,

    auth: {
        user: 'lindennerd@gmail.com',
        pass: '574r@w4r5123',
    },

    maxUpdateSize: 20
});

imap.login().then(function () {
    console.log('logged');
    imap.listMessages({
        path: 'INBOX',
        firstUid: '64605',
        lastUid: '*'
    }).then(function (messages) {
        //console.log(messages);
        for (var index in messages) {
            var email = messages[index];
            imap.getBodyParts({
                path: 'INBOX',
                uid: email.uid,
                bodyParts: email.bodyParts
            }).then(function (bodyParts) {
                mailreader.parse({bodyParts: bodyParts}, function (err, bodyParts) {
                    console.log(bodyParts[0].content[0]);
                });
            })
        }

    }).then(function () {
        imap.logout();
    })
});

// ref https://github.com/whiteout-io/imap-client
// ref https://www.npmjs.com/package/mailreader