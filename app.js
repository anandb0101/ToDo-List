const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anandb0101:QW5hbmRi@cluster0.9nq2x.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify:false });

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

app.get("/", function (req, res) {
    Item.find({}, function(err, foundItems){
        if(err) {
            console.log(err);
        } else {
            if(foundItems.length === 0) {
                Item.insertMany(defaultItems, function(err){
                    if(err)
                        console.log(err);
                    else
                        console.log("seccessfully connected to database");
                });
                res.redirect("/");
            } else {
                    res.render("list",{
                        listTitle:"Today",
                        newListItem:foundItems,
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

app.get("/list/:costumListName", function(req,res){
    const costumListName = _.capitalize(req.params.costumListName);

    List.findOne({name:costumListName}, function(err, foundList){
        if(!err) {
            if(!foundList) {
                const list = new List({
                    name:costumListName,
                    items:defaultItems
                });
                list.save();
                
                res.redirect("/list/"+costumListName);
            } else {
                res.render("list",{
                    listTitle:foundList.name,
                    newListItem:foundList.items,
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
    
    if(listName === "Today") {
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

    if(checkedListName === "Today") {
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

app.get("/createNewList", function(req,res){
    res.render('create');
});

app.post("/createNewList", function(req,res) {
    const listName = req.body.newList;
    res.redirect("/list/"+listName);
});


app.get("/about" ,function(req, res) {
    res.render('about');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("server started at port "+port+" succesfully!");
});
