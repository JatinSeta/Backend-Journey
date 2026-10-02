const express = require("express");
const app = express();
const PORT = 4000
app.get('/',(req,res)=>{
    res.send("<h1>Home Page</h1>")
})
app.get('/about',(req,res)=>{
    res.send("<h1>About Page</h1>")
})

app.listen(PORT,()=>{
    console.log("Server Running ...")
})