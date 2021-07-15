const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var today = new Date();
var currentDay = today.getDay();
var day = "";
var items = ["Exercise"];
var workItems = [];

var options = {
    weekday: 'long',
    year:'numeric',
    month: 'long',
    day: 'numeric'
};

app.get("/", function (req, res) {
        day = today.toLocaleDateString("en-US", options);

    res.render("list",{
        listTitle:day,
        newListItem:items
    });
});

app.post("/", function(req,res) {
    // console.log(req.body);
    var item = req.body.newItem;
    if(req.body.list === "Work List") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function(req, res) {
    res.render('list', {
        listTitle:"Work List",
        newListItem:workItems
    })
});

app.get("/about" ,function(req, res) {
    res.render('about');
});


app.listen(3000, function () {
    console.log("server started at port 3000");
});
