'use strict'
require('./config/config');
const express=require('express');
const mongoose=require('mongoose');
const app=express();
const bodyParser=require('body-parser');
const morgan = require('morgan')
//x-www-form-urlencoded
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: false}));
//json
app.use(bodyParser.json());

//routes
app.use(require('./routes/index'));
//app.use(express.static(path.resolve(__dirname,'../public')))

mongoose.connect('mongodb://localhost:27017/FeriadosDB',(err)=>{
	if(err) throw err;
	console.log('Base de datos en el aire');
});
app.listen(PORT,()=>{
	console.log("Escuchando el puerto ",PORT);
});