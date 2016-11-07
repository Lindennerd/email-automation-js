var ImapClient = require('imap-client');
var mailreader = require('mailreader');
var sqlite3 = require('sqlite3').verbose();
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport('smtps://lindennerd@gmail.com:<PASSWORD>@smtp.gmail.com');
var db = new sqlite3.Database('.\\emailautomation.db');
var imap = configure();
run();

function run() {
    main(function () {
        setTimeout(main, 1000);
    });
}

function main(callback) {

    initDB(function (lastUid) {

        imap.login().then(function () {
            imap.listenForChanges({ path: 'INBOX' }).then(function () {
                imap.listMessages({
                    path: 'INBOX',
                    // firstUid: '64605',
                    firstUid: lastUid || '4500',
                    lastUid: '*'
                }).then(function (messages) {
                    for (var index in messages) {
                        var email = messages[index];

                        if (email.subject.indexOf('Typeform') !== -1) {
                            imap.getBodyParts({
                                path: 'INBOX',
                                uid: email.uid,
                                bodyParts: email.bodyParts
                            }).then(function (bodyParts) {
                                mailreader.parse({ bodyParts: bodyParts }, function (err, bodyParts) {
                                    var html = bodyParts.filter(function (part) {
                                        if (part.type === 'html') {
                                            return part;
                                        }
                                    });
                                    var li = cheerio('li:contains("What is your email address")', html[0].content);
                                    var emailAddress = li.find('a').text();
                                    insert(email.uid, emailAddress, db);
                                    sendEmail(emailAddress);
                                });
                            });
                        }
                    }
                });
            });
        });
    });
}
function configure() {
    var imap = new ImapClient({
        port: 993,
        host: 'imap.gmail.com',
        secure: true,
        ignoreTLS: false,
        requireTLS: true,

        auth: {
            user: 'lindennerd@gmail.com',
            pass: '',
        },

        maxUpdateSize: 20
    });
    return imap;
}

function initDB(cb) {
    db.run('create table if not exists emailautomation (lastUid INTEGER, email TEXT)');
    db.each('select max(lastUid) as lastUid from emailautomation', function (err, row) {
        cb(row.lastUid);
    })
}

function insert(uid, email, db) {
    var stmt = db.prepare("INSERT INTO emailautomation VALUES (?, ?)");
    stmt.run(uid, email);
    stmt.finalize();
}

function sendEmail(address) {
    var mailOPtions = {
        from: 'Luiz Paulo <lindennerd@gmail.com>',
        to: 'lindennerd@gmail.com', //address,
        subject: 'Hi from Test',
        text: 'Hello World'
    };

    transporter.sendMail(mailOPtions, function (err, info) {
        if (err) { console.log(err) }
        console.log(info);
    })
}

// ref https://github.com/whiteout-io/imap-client
// ref https://www.npmjs.com/package/mailreader