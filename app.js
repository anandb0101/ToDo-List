const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

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

const defaultItems = [item1, item2, item3];

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
                Item.insertMany(defaultItems, function(err){
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

const listSchema = mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/:costumListName", function(req,res){
    const costumListName = _.capitalize(req.params.costumListName);

    List.findOne({name:costumListName}, function(err, foundList){
        if(!err) {
            if(!foundList) {
                const list = new List({
                    name:costumListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+costumListName);
            } else {
                res.render("list",{
                    listTitle:foundList.name,
                    newListItem:foundList.items
                });
            }
        }
    });
    
});

app.post("/", function(req,res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    });
    
    if(listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
        });
        res.redirect("/"+listName);
    }

});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const checkedListName = req.body.list;

    if(checkedListName === day) {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err)
                console.log(err);
            else
                res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name:checkedListName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
            if(!err) {
                res.redirect("/"+checkedListName);
            }
        });
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
