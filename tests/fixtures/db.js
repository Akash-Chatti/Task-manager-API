const User= require("../../src/models/users")
const jwt= require('jsonwebtoken')
const mongoose=require('mongoose')
const Task=require('../../src/models/tasks')

const objId=new mongoose.Types.ObjectId()
const userTest={
    _id:objId,
    name:'tester',
    email:'checking@test.com',
    password:'pass@1234',
    tokens:[{
        token:jwt.sign({_id:objId},process.env.jsonwebtoken)
    }]
}

const objId2=new mongoose.Types.ObjectId()
const userTest2={
    _id:objId2,
    name:'Another tester',
    email:'testing@AT.com',
    password:'pass@1234',
    tokens:[{
        token:jwt.sign({_id:objId2},process.env.jsonwebtoken)
    }]
}
const taskOne={
    _id: new mongoose.Types.ObjectId(),
    Description:'The root task',
    Completed:false,
    owner:userTest._id
}
const taskTwo={
    _id: new mongoose.Types.ObjectId(),
    Description:'The Second root task',
    Completed:false,
    owner:userTest._id
}

const taskThree={
    _id: new mongoose.Types.ObjectId(),
    Description:'The first task usr2',
    Completed:false,
    owner:userTest2._id
}

const dbConfig= async()=>{
await User.deleteMany()
await Task.deleteMany()
await new User(userTest).save()
await new User(userTest2).save()
await new Task(taskOne).save()
await new Task(taskTwo).save()
await new Task(taskThree).save()
}

module.exports={dbConfig,userTest,userTest2,taskOne,taskTwo,taskThree}