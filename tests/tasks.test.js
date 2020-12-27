const Task=require('../src/models/tasks')
const request= require('supertest')
const app= require("../src/app")
const User= require("../src/models/users")
const {dbConfig,userTest,userTest2,taskOne,taskTwo,taskThree}=require('./fixtures/db')

beforeEach(dbConfig)

test('Should create Task for a user',async()=>{
var resp=await request(app).post('/tasks')
.set('Authorization',`Bearer ${userTest.tokens[0].token}`)
.send({
    Description:'Test script task'
}).expect(201)
var tsk= await Task.findById(resp.body._id)
expect(tsk).not.toBeNull()
expect(tsk.Completed).toEqual(false)
})

test('Should get all tasks for first user',async()=>{
    var resp= await request(app)
    .get('/tasks')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send()
    .expect(200)
    expect(resp.body.length).toEqual(2)
})

test('Should fail to delete task by unauthorised user',async()=>{
    var resp= await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTest2.tokens[0].token}`)
    .send()
    .expect(404)
    var tsk= await Task.findById(taskOne._id)
    expect(tsk).not.toBeNull()
})
