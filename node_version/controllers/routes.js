module.exports = function(app, upload, connection){

    app.get("/", function(req, res){ //first request
        res.sendFile("views/index.html", {"root": __dirname + "/../"});
    });

    app.post("/", function(req, res){ //login credentials submitted
        var email = req.body.email;
        var password = req.body.password;
        //loginUser(email, password, res);
        //assume user login is valid and return sample data
        res.sendFile("views/member.html", {"root": __dirname + "/../"});
    });

    app.post("/member", function(req, res){ //get user markers and photos
        res.send({"name": "Lakayla"});
    });

    app.post("/addphoto", upload.single("photo"), function(req, res){
        console.log(req.body);
        console.log(req.file);
        res.send({
            "title": req.body.title,
            "description": req.body.description,
            "filename": req.file.filename
        });
    });

    function loginUser(email, password, res) {
    	connection.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, function (error, result) {
    	    if (error) { res.send({err: error}); return; }
    	    if (result.length == 0) { res.send({token: false}); return; }
    	    console.log(result);
    	    // do the success thing
    	    if (result.length == 1) {
    		    var user = { email: email, auth: true };
    			var token = jwt.sign(user, secrets.secret);
    			res.send({'token': token});
    		}
      	});
    }

};
