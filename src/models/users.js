const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt= require('jsonwebtoken')
const Task= require('./tasks')


const UserSchema=new mongoose.Schema(
    {

    name:{
    type:String,
    required:true,
    trim:true
    },
    email:{type:String,
        trim:true,
        unique:true,
        validate(value){
    
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
                
            }
        },
        lowercase:true,
        required:true
    
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
            { throw new Error('Age cannot be a negative number')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password'))
            {
                throw new Error('Please use a better password with atleast 6 characters')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
    
    },{timestamps:true})


//virtual specifies the relation b/w the models but does not store this field in DB

UserSchema.virtual(('tasks'),{
ref:'Task',
//define the foreignkey field in another model i.e, Task
foreignField:'owner',
//PK field in current model
localField:'_id'

})


// Static methods are available on models and methods created by schema.methods 
// are available on model instances
UserSchema.methods.genAuthToken=async function(){
const user=this
const tkn =jwt.sign({_id:user._id.toString()},process.env.jsonwebtoken)
user.tokens= user.tokens.concat({token:tkn})
await user.save()
return tkn

}

UserSchema.methods.toJSON= function (){
const user = this
var userObj=user.toObject()
delete userObj.password
delete userObj.tokens
delete userObj.avatar

return userObj
}
//Creating a static method for User Model
UserSchema.statics.findByCredentials= async (email,password)=>{
        const user =await User.findOne({email})
        if(!user)
        throw  new Error('Unable to login')

        var isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch)
        throw new Error('Unable to login')
        return user
}
// middleware to execute before saving user
// Hash plain text password before saving
UserSchema.pre('save',async function(next){
const user= this

if(user.isModified('password'))
{
    user.password= await bcrypt.hash(user.password,8)

}
next()
})

// middleware to remove user
UserSchema.pre('remove',async function(next){
const user= this
await Task.deleteMany({owner:user._id})
next()
})

const User = mongoose.model("User",UserSchema )

module.exports=User