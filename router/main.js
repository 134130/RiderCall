var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'John0114!!',
    database: 'webserver_db'
});

connection.connect();

module.exports = function (app, fs) {
    app.get('/', function (req, res) {
        if (req.session.userid == null) {
            res.render('login', {
                title: 'Login Page'
            });
        } else {
            if (req.session.type == 'restaurant') {
                connection.query('SELECT c.no, c.order_time, c.status, u.phone FROM calls AS c LEFT JOIN users AS u ON c.rider_id = u.id WHERE c.rest_id=' + req.session.userid + ' AND (c.status!="finished" AND c.status!="cancled") ORDER BY c.no DESC;', function (err, rows, fields) {
                    var noList = new Array();
                    var order_timeList = new Array();
                    var statusList = new Array();
                    var phoneList = new Array();

                    for(var i=0; i<rows.length; i++) {
                        noList.push(rows[i]['no']);
                        order_timeList.push(rows[i]['order_time']);
                        statusList.push(rows[i]['status']);
                        phoneList.push(rows[i]['phone']);
                    }
                    res.render('restaurantIndex', {
                        title: "Restaurant",
                        userid: req.session.userid,
                        noList: noList,
                        order_timeList: order_timeList,
                        statusList: statusList,
                        phoneList: phoneList
                    });
                });

            } else if (req.session.type == 'rider') {
                connection.query('SELECT c.no, u.name, c.order_time, c.status, c.rider_id, u.phone FROM calls AS c JOIN users AS u ON u.id=c.rest_id WHERE status!="finished" AND status!="cancled" AND (c.rider_id=' + req.session.userid + ' OR c.rider_id IS NULL) ORDER BY status, c.no DESC;', function(err, rows, fields) {
                    var noList = new Array();
                    var nameList = new Array();
                    var order_timeList = new Array();
                    var statusList = new Array();
                    var rider_idList = new Array();
                    var phoneList = new Array();

                    for(var i=0; i<rows.length; i++) {
                        noList.push(rows[i]['no']);
                        nameList.push(rows[i]['name']);
                        order_timeList.push(rows[i]['order_time']);
                        statusList.push(rows[i]['status']);
                        rider_idList.push(rows[i]['rider_id']);
                        phoneList.push(rows[i]['phone']);
                    }
                    res.render('riderIndex', {
                        title: "Rider",
                        noList: noList,
                        nameList: nameList,
                        order_timeList: order_timeList,
                        statusList: statusList,
                        rider_idList: rider_idList,
                        phoneList: phoneList
                    });
                });
            }
        }

    });

    app.post('/login', function (req, res) {
        var sess = req.session;
        var id = req.body.id;
        var pw = req.body.pw;
        connection.query('SELECT id, user_pw, type FROM users where user_id="' + id + '";', function (err, rows, fields) {
            if (!err) {
                if (rows[0]['user_pw'] == pw) {
                    sess.userid = rows[0]['id'];
                    sess.type = rows[0]['type'];
                    console.log(sess.type);
                    res.send('<script>window.location.href = "/";</script>');
                } else {
                    res.send('<script>alert("Wrong Password");window.location.href = "/";</script>');
                }
            } else {
                res.render('index', {
                    title: 'Login Fail'
                });
            }
        });

    });

    // rider
    app.get('/rider/accept', function (req, res) {
        var sess = req.session;
        connection.query('UPDATE calls SET status="accepted", rider_id=' + sess.userid + ' WHERE no=' + req.query.no + ' AND status="waiting";', function (err, rows, fields) {
            if (!err) {
                res.send('<script>window.location.href = "/";</script>');
            } else {
                res.send('<script>alert("이미 배차된 콜입니다.");window.location.href = "/";</script>');
            }
        });
    });

    app.get('/rider/running', function (req, res) {
        var sess = req.session;
        connection.query('UPDATE calls SET status="running" WHERE no=' + req.query.no + ' AND status="accepted";', function (err, rows, fields) {
            if (!err) {
                res.send('<script>window.location.href = "/";</script>');
            } else {
                res.send('<script>alert("에러발생");window.location.href = "/";</script>');
            }
        });
    });

    app.get('/rider/finish', function (req, res) {
        var sess = req.session;
        connection.query('UPDATE calls SET status="finished" WHERE no=' + req.query.no + ' AND status="running";', function (err, rows, fields) {
            if (!err) {
                res.send('<script>window.location.href = "/";</script>');
            } else {
                res.send('<script>alert("에러발생");window.location.href = "/";</script>');
            }
        });
    });

    /*app.get('/rider/cancle', function (req, res) {
        var sess = req.session;
        connection.query('UPDATE calls SET status="cancled" WHERE no=' + req.query.no + ' AND status="waiting";')
    });*/



    // restaurant
    app.all('/call_rider', function (req, res) {
        var sess = req.session;
        connection.query('INSERT INTO calls(rest_id, order_time, status) VALUES("' + sess.userid + '", NOW(), "waiting");', function (err, rows, fileds) {
            if (!err) {
                res.send('<script>window.location.href = "/";</script>');
            } else {
                alert("에러발생!");
                res.send('<script>window.location.href = "/";</script>');
            }
        });
    });

    app.get('/rest/cancle', function (req, res) {
        var sess = req.session;
        connection.query('UPDATE calls SET status="cancled" WHERE no=' + req.query.no + ';', function (err, rows, fields) {
            if (!err) {
                res.send('<script>window.location.href = "/";</script>');
            } else {
                res.send('<script>alert("에러발생");window.location.href = "/";</script>');
            }
        });
    });
}