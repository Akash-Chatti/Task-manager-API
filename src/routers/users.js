const express= require('express')
const sharp= require('sharp')
const multer=require('multer')
const User=require('../models/users')
const auth= require('../middleware/auth')
const router= new express.Router()
//app.use(express.json()) is defined in index.js and that will be use to parse req 
//when this router is loaded

router.post('/users',async (req,res)=>{
 
       var user= new User(req.body)
       try{
        
        var tkn= await user.genAuthToken()
        await user.save()
           res.status(201).send({user,tkn})
       }catch(e){
           res.status(400).send(e)
       }
   })
   router.get('/users/me',auth,async (req,res)=>{
   
     try{
       
       res.send(req.user)
     }catch(e){
         res.status(500).send()
     }
   })
   // use :id  as routing parameter, you can also have /users/city=abc in the url i.e key value
   // to get the second type from req.query.city and first from req.params.id
//    router.get('/users/:id',async (req,res)=>{
//    var _id= req.params.id
//    try{
//    const usr= await User.findById(_id)
//    if(usr)
//    res.send(usr)
//    else
//    res.status(404).send('User not found')
//    }catch(e){
//        res.send(e)
//    }
   
//    })
   
   router.patch('/users/me',auth,async(req,res)=>{
    const updates= Object.keys(req.body)
     const allowedPropertiesToUpdate  =['name','email','password','age']
     var IsAllowed= updates.every((prop)=>allowedPropertiesToUpdate.includes(prop))
     if(!IsAllowed){
         return res.status(400).send('Invalid update')
     }
       try
       {
   //{new : true} returns the updated record else old rec will be returned
  // const usr=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
  // changing to let middleware in schema work
  //const usr= await User.findById(req.params.id)
  const usr= req.user
   updates.forEach((prop)=>usr[prop]=req.body[prop])
        await usr.save()
//   if(!usr){
//    return res.status(404).send('User not found')
//    }
   res.send(usr)
   
       }catch(e){
           res.status(400).send(e)
       }
   
   })
   
   router.delete('/users/me',auth,async(req,res)=>{
       try{
           //user object is added to req in auth middleware
       
        //    const user=await User.findByIdAndDelete(req.user._id)
        //    if(!user)
        //    {
        //        return res.status(404).send('User not found')
        //    }

            await req.user.remove()
           res.send('deleted: '+ req.user)
       }catch(e){
           res.status(500).send()
       }
   })
   router.post('/users/login',async (req,res)=>{
    try{
        const user =await User.findByCredentials(req.body.email,req.body.password)
        const tkn= await user.genAuthToken()
 res.send({user,tkn})
    }catch(e){
        res.status(400).send()
    }



   })
   router.post('/users/logout',auth,async(req,res)=>{
try{
 req.user.tokens=req.user.tokens.filter((tkn)=>{
    return tkn.token !==req.token
 })
 await req.user.save()
 res.send()
}
catch{
res.status(500).send()
}

   })


    router.post('/users/logallout',auth,async(req,res)=>{
    try{
     req.user.tokens=[]
     await req.user.save()
     res.send()
    }
    catch{
    res.status(500).send()
    }
    
       })

    const proPics= multer({
        //dest defines the destination path in local storage 
        //to store it else where manage it in the fouter functio
    //dest:'avatars',
    limits:{
    fileSize:1000000
    },
    fileFilter(req,file,cd){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
           return cd(new Error('Please upload jpg/png image only'))
        }
        cd(undefined,true)
    }

})
    // proPic is the multer function which will act as middleware
// the last callback function with error,req,res,next as parameters will run when there is an error in middleware
    router.post('/user/me/profilePic',auth,proPics.single('avatar'),async (req,res)=>{
        //sharp package can be use to modify the image files
        var buff=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.user.avatar=buff
        await req.user.save()
        res.send()
       },(error,req,res,next)=>{
           res.status(403).send({error:error.message})
           next()
       })

       router.delete('/user/me/profilePic',auth,async (req,res)=>{
        req.user.avatar=undefined
        await req.user.save()
        res.send()
       })
       // call this from b rowser to see the image
       router.get('/user/:id/profilePic',async (req,res)=>{
        try
        {
        var user=await User.findById(req.params.id)
        if(!user||!user.avatar)
        {
            throw new Error()
        }
        // type will always be png as we are converting before insert
        res.set('Content-Type','image/png')
        res.send(user.avatar)
        }
        catch(e){
            res.status(404).send('User / Profile pic not found')
        }

       })

module.exports=router