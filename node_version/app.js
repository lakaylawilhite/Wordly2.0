var express = require("express"),
    path = require("path"),
    crypto = require("crypto"),
    bodyParser = require("body-parser"),
    multer = require("multer"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./public/uploads");
        },
        filename: function (req, file, cb) {
            crypto.pseudoRandomBytes(16, function (err, raw) {
                if (err) return cb(err);
                cb(null, raw.toString("hex") + path.extname(file.originalname));
            });
        }
    }),
    //upload = multer({dest: path.join(__dirname, "public/uploads")}),
    upload = multer({ storage: storage }),
    secrets = require("./etc/secrets"),
    mysql = require("mysql"),
    jwt = require("jsonwebtoken"),
    app = express(); //,
    // connection = mysql.createConnection({
    //     host     : "localhost",
    //     user     : secrets.user,
    //     password : secrets.password,
    //     database : secrets.database // insert your sql database name here
    // });


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/member", function(req, res, next) {
	// const token = req.body.token;
	// jwt.verify(token, secrets.secret, function(err, decoded) {
    //     if (err) {
    //         return res.json({ success: false, message: 'Failed to authenticate token.' });
    //     } else {
    //         // if everything is good, save to request for use in other routes
    //         req.decoded = decoded;
    //         req.token = token;
    //         next();
    //     }
    // });
});

app.use("/member", function(req, res, next) {
	// if (req.decoded.auth === true) {
	// 	res.send({
	// 		message: 'You are authenticated! Now you can do stuff by sending this token with each request.',
	// 		token: req.token
	// 	});
	// }
});

require("./controllers/routes.js")(app, upload); //, connection);

app.listen(3001, function () {
    console.log("App listening on port 3001!");
});
