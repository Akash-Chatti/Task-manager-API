const express=require('express')
require('../db/mongoose')
const router= new express.Router()
const Task= require('../models/tasks')
const auth=require('../middleware/auth')

    router.post('/tasks',auth,async (req, res)=>{
    //var task=new Task(req.body)
   var task= new Task({
       //Following copies whole body object to task object
       ...req.body,
        owner:req.user._id
   })
    try{
     await task.save()
     res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
    
    })
    
    
    //GET tasks?completed=boolean
    //GET tasks?limit=5&skip=10 skip specifies no. of records to be skipped (skip= limit*page index 0,1,2)
    //and the next 5 will be displayed
    //GET tasks?sortBy=createdAt:desc/asc or tasks?sortBy=Completed:desc/asc
    router.get('/tasks',auth,async (req,res)=>{
        try{
        //const tsks= await Task.find({owner:req.user._id})     
       // res.send(tsks)
        
       const match={}
       const sort={}
       if(req.query.completed)
       {
           match.Completed=req.query.completed==='true'
       }
       if(req.query.sortBy)
       {
           const parts=req.query.sortBy.split(':')
           sort[parts[0]]= parts[1]==='desc'?-1:1
       }
       //await req.user.populate('tasks').execPopulate()
       await req.user.populate({path:'tasks',match,
    options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
    }
}).execPopulate()
       if(req.user.tasks.length==0)
       return res.send('Your tasks list is empty')
       res.send(req.user.tasks)
       }catch(e){
        res.status(500).send()
       }
    
    })
    
    router.get('/tasks/:id',auth,async (req,res)=>{
    
        var _id= req.params.id
        try{
         
           // const tsk= await Task.findById(_id)
           const tsk= await Task.findOne({_id,owner:req.user._id})
            if(!tsk)
            return res.status(404).send('Task not found')
            res.send(tsk)
        }catch(e){
            res.status(500).send()
        }
    })
    
    router.patch('/tasks/:id',auth,async(req,res)=>{
    const  updates=Object.keys(req.body)
    const allowedUpdates=['Description','Completed']
    const IsAllowed=updates.every((prop)=>allowedUpdates.includes(prop))
    if(!IsAllowed){
        return res.status(400).send('Invalid update')
    }
    try{
   // const tsk=await Task.findByIdAndUpdate(req.params.id,req.body,{runValidators:true,new:true})
   //const tsk=await Task.findById(req.params.id) 
   const tsk =await Task.findOne({_id:req.params.id,owner:req.user._id})
   if(!tsk)
    {
        return res.status(404).send('Task not found')
    }
    updates.forEach((prop)=>tsk[prop]=req.body[prop])
    await tsk.save()
    res.send(tsk)
    }catch(e){
    res.status(400).send('Error '+e)
    }
    })
    
    router.delete('/tasks/:id',auth,async (req,res)=>{
        try{
           // const tsk=await  Task.findByIdAndDelete(req.params.id)
           const tsk =await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        
            if(!tsk)
            {
                return res.status(404).send('Task not found')
            }
            res.send('Deleted task : '+tsk)
        }
        catch(e){
            res.status(500).send()
        }
    })
    

module.exports= router