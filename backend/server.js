const express = require('express');
const app = express();



app.get('/',(req,res)=>{
    return res.end("<html><h1> We will back soon !!!! </h1></html>");
});
app.listen(8000,()=>{console.log("Server Started")});