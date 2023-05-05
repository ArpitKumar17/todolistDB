const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");
const app = express();

mongoose.connect("mongodb+srv://ArpitKumar:Arpit Kumar1730@atlascluster.rp5zgx5.mongodb.net/todolistDB");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hey! whats-up."
});
const item3 = new Item({ name: "Hello there.." });
const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
     name:String,
     item:[itemSchema]
});
const List = mongoose.model("List",listSchema);
app.get("/", function (req, res) {
    
    Item.find().then((foundItem)=>{
        if(foundItem.length===0){

            Item.insertMany([defaultItems]).then(()=>console.log("Success")).catch((err)=>console.log(err));
            res.redirect("/");
}
        else{
            res.render("list",{listTitle:"Today", newListItem:foundItem});
        }
    }).catch((err)=>console.log(err));

});
app.get("/:customListName",function(req,res){
const customListName= _.capitalize(req.params.customListName);
List.findOne({name:customListName}).then((foundList)=>{
    if(!foundList){
        console.log("Doesn't exist!");
    }
    else{
        res.render("list",{listTitle:foundList.name, newListItem:foundList.item});
    }
}).catch((err)=>console.log(err));
const list = new List({name:customListName,
item:defaultItems});
list.save();
});
app.post("/", function (req, res) {
    const itemName = req.body.Task1;
    const listName= req.body.list;
    const items = new Item({name:itemName});
    
    if(listName=== "Today"){
        items.save();
        res.redirect("/");
    }
   else{
    List.findOne({name:listName}).then(function(foundList){
        const foundListItem = foundList.item;
        foundListItem.push(items);
        foundList.save();
        res.redirect("/"+listName);
    }).catch((err)=>console.log(err));
   };
   
});
app.post("/delete",function(req,res){
  const checkBoxID= req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndDelete(checkBoxID).then(()=>console.log("Success")).catch((err)=>console.log(err));    
    res.redirect("/");

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkBoxID}}}).then((foundList)=>{res.redirect("/"+listName);}).catch((err)=>{console.log(err);});
  }
 

});
app.listen(3000, function () {
    console.log("The server is running on port 3000");
});

