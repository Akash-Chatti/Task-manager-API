const request=require("supertest")
const app= require("../src/app")

test('Add a new user',async ()=>{
    await request(app).post('/users').send({
        name:'Aakash',
        email:'akash@gmail.com',
        password:'passcode'

    })
})