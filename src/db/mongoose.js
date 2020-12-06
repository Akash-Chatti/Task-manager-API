const mongoose=require('mongoose')
//get the confidential credentials from environment file
mongoose.connect(process.env.mongooseConstr,
{useUnifiedTopology:true,useCreateIndex:true,
useNewUrlParser:true, useFindAndModify:false})