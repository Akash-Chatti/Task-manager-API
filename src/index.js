const express= require('express')
require('./db/mongoose')
const app=express()
const userRouter= require('./routers/users')
const tasksRouter=require('./routers/tasks')
const port =process.env.PORT
// oreder of declaring/defining app.use() methods is important 
// app.use((req,res,next)=>{
//     console.log(req.method,req.path)
//     if(req.method==='POST'){
//         res.send('Post requests are disabled')
//     }
//     else
//     next()
//     })

// app.use((req,res,next)=>{
//     res.status(503).send('Service is temporarily unavailable')
// })
//Setup express to parse the req for json body
app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)





app.listen(port,()=>{console.log('Server is up on port '+port)})