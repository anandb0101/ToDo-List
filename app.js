const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify:false });

const itemsSchema = mongoose.Schema({
    name:String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name : "welcome to ToDo List"
});
const item2 = new Item({
    name : "hit + to add new item"
});
const item3 = new Item({
    name : "<-- hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

var today = new Date();
var currentDay = today.getDay();
var day = "";

var options = {
    weekday: 'long',
    year:'numeric',
    month: 'long',
    day: 'numeric'
};

app.get("/", function (req, res) {
    day = today.toLocaleDateString("en-US", options);

    Item.find({}, function(err, foundItems){
        if(err) {
            console.log(err);
        } else {
            if(foundItems.length === 0) {
                Item.insertMany(defaultItem, function(err){
                    if(err)
                        console.log(err);
                    else
                        console.log("seccess");
                });
                res.redirect("/");
            } else {
                res.render("list",{
                    listTitle:day,
                    newListItem:foundItems
                });
            }
        }
    });
});

app.post("/", function(req,res) {
    var itemName = req.body.newItem;
    const item = new Item({
        name:itemName
    });
    Item.insertMany(item, function(err){
        if(err)
            console.log(err);
        else
            res.redirect("/");
    });
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(err)
            console.log(err);
        else
            res.redirect("/");
    });
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

app.get("/:costumListName", function(req,res){
    console.log(req.params.costumListName);
});


app.listen(3000, function () {
    console.log("server started at port 3000");
});
