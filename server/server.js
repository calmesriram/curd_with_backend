const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
var multer = require('multer');
var upload = multer({ dest: 'media/' });
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set('setsecret', "curd2020");
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './media');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

// const upload = require('./multerconfig');

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("listening");
});
cloudinary.config({
    cloud_name: "nillafruitssalem",
    api_key: "539743922376667",
    api_secret: "Bmh7U36-NIVPAecQHLkGSETy8VE"
})

mongoose.connection.on('connected', function() {
    console.log('Connection to Mongo established.');
    if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
        mongoose.connection.db = mongoose.connection.client.db("curd2020");
    }
});
mongoose.connect("mongodb+srv://nillafruitssalem:nillafruitssalem@cluster0-qp8wu.mongodb.net/admin?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", { dbName: "curd2020", useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).catch(err => {
    if (err) {

        console.log("TEST", err)
        return err;
    }
})

var user = require('./schema/user')
var News = require('./schema/news')

app.get("/", (req, res) => {
    res.send("Connected");
    res.end();
})

app.post("/Register", (req, res) => {
    const User = new user({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    })
    User.save((err, data) => {
        if (err) {
            console.log(err, "while saving saree");
            return res.json({ status: false, msg: err })
        }
        if (!err) {
            return res.json({ status: true, msg: "User created successfull" })
        }
    })
})


app.post("/login", (req, res) => {
    user.find({ "username": req.body.username, "password": req.body.password }, (err, data) => {
        if (err) {
            return res.json({ status: false, msg: err })
        }
        if (!err) {
            if (data.length == 0) {
                return res.json({ status: false, msg: "User Does Not Exists", data: data })
            } else {

                jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data: req.body.emailid },
                    app.get('setsecret'), (e, d) => {
                        if (e) {
                            return res.json({ "status": false, "Error": e });
                        }
                        if (d) {
                            return res.json({ status: true, data: data, token: d })
                        }
                    })
            }
        }
    })
})

// jwt auth
app.use((req, res, next) => {
    var token = req.headers['access-token']
    if (token) {
        jwt.verify(token, app.get('setsecret'), (err, data) => {
            if (err) {
                res.json({ status: false, msg: "invalid token", Error: err });
                res.end();
            } else {
                next();
            }
        })
    } else {
        res.json({ status: false, msg: 'no token provided' });
        res.end();
    }
})

app.get("/user", (req, res) => {
    user.find({}, (err, data) => {
        if (err) {
            return res.json({ status: false, msg: err })
        }
        if (!err) {
            return res.json({ status: true, data: data })
        }
    })
})

app.post("/Create", upload.single('profile'), (req, res) => {
    let myarray = [];
    myarray.push(JSON.stringify(req.body));
    let a = JSON.parse(myarray)
    cloudinary.uploader.upload(req.file.path, (err, data) => {
        if (err) {
            return res.json({ "status": false, data: err });
        }
        if (data) {
            const news = new News({
                username: a.username,
                name: a.name,
                description: a.description,
                image: data.secure_url
            })
            news.save((err, data) => {
                if (err) {
                    console.log(err, "while saving saree");
                    return res.json({ status: false, msg: err })
                }
                if (!err) {
                    return res.json({ status: true, msg: "Record created successfull" })
                }
            })
        }
    })

})

app.post("/View", (req, res) => {
    News.find({ "username": req.body.username }, (err, data) => {
        if (err) {
            return res.json({ status: false, msg: err })
        }
        if (!err) {
            return res.json({ status: true, data: data })
        }
    })
})

app.put("/Update", upload.single('profile'), (req, res) => {
    let myarray = [];
    myarray.push(JSON.stringify(req.body));
    let a = JSON.parse(myarray)
    console.log(a)
    cloudinary.uploader.upload(req.file.path, (err, data) => {
        if (err) {
            return res.json({ "status": false, data: err });
        }
        if (data) {
            News.findOneAndUpdate({ "newsid": a.newsid }, {
                "username": a.username,
                "name": a.name,
                "description": a.description,
                "image": data.secure_url
            }).then(data => {
                console.log(data)
                return res.json({ status: true, msg: "Updated successfully" })
            }).catch(err => {
                return res.json({ status: false, msg: err })
            })
        }
    })
})

app.post("/Delete", (req, res) => {
    News.findOneAndDelete({ "newsid": req.body.newsid }).then(data => {
        return res.json({ status: true, msg: "Deleted successfully" })
    }).catch(err => {
        return res.json({ status: false, msg: err })
    })
})