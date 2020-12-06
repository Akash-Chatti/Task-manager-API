const jwt=require('jsonwebtoken')
const User=require('../models/users')

const auth= async (req,res,next)=>{
    try{
        var token= req.header('Authorization').replace('Bearer','').trim()
        var decode=jwt.verify(token,process.env.jsonwebtoken)
        var user=await User.findOne({_id:decode._id,'tokens.token':token})
        if(!user)
        {
            throw new Error('Invalid token')
        }
        req.token=token
req.user=user
//console.log(user)

next()
    }
    catch(e)
    {
res.send('Not Authorized.')
    }
}
module.exports=auth