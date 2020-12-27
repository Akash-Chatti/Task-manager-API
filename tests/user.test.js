const request=require("supertest")
const app= require("../src/app")
const User= require("../src/models/users")
const {dbConfig,userTest}=require('./fixtures/db')
beforeEach(
dbConfig
)

test('Add a new user',async ()=>{
    var resp=await request(app).post('/users').send({
        name:'Aakash',
        email:'akash@gmail.com',
        password:'passcode'

    }).expect(201)
    const user= await User.findById(resp.body.user._id)
    expect(user).not.toBeNull()
    expect(resp.body).toMatchObject(        
    {      
    user:{
        name:'Aakash',
        email:'akash@gmail.com',
    },
        tkn:user.tokens[0].token
    }
    )
    expect(user.password).not.toBe('passcode')
})

test('Login user success',async()=>{
const resp=await request(app).post('/users/login').send({
    email:userTest.email,
    password:userTest.password
}
).expect(200)
expect(resp.body.user).not.toBeNull()
var usr=await User.findById(resp.body.user._id)
expect(usr).not.toBeNull()
expect(usr.tokens[1].token).toBe(resp.body.tkn)

})
test('Login user validations',async()=>{
    await request(app).post('/users/login').send({
        email:userTest.email,
        password:'varwar2345'
    }).expect(400)  
    })
test('Get profile',async()=>{
await request(app).get('/users/me')
.set('Authorization',`Bearer ${userTest.tokens[0].token}`)
.send()
.expect(200)

})

test('should not get profile unauthorized user',async()=>{
    await request(app).get('/users/me')
    .send()
    .expect(401)
    
    })

test('should delete account',async()=>{
var resp=await request(app).delete('/users/me')
.set('Authorization',`Bearer ${userTest.tokens[0].token}`)
.send().expect(200)
var usr=await User.findById(resp.body._id)
expect(usr).toBeNull()
})
test('should not delete account unauthorized user',async()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('should save profile pic',async()=>{
await request(app).post('/user/me/profilePic')
.set('Authorization',`Bearer ${userTest.tokens[0].token}`)
.attach('avatar','./tests/fixtures/profile-pic.jpg')
.expect(200)
var usr= await User.findById(userTest._id)
expect(usr.avatar).toEqual(expect.any(Buffer))

})
test('should update valid fields',async()=>{
    await request(app).patch('/users/me')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send(
        {
            name:'Pete'
        }
    )
    .expect(200)
    var usr=await User.findById(userTest._id)
    expect(usr.name).toMatch('Pete')
})

test('should not update invalid fields',async()=>{
    await request(app).patch('/users/me')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send(
        {
            location:'Manali'
        }
    )
    .expect(400)
})