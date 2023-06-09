const express = require('express')
require('./db/config');
const User = require("./db/User");
const Product = require("./db/Product");
const cors = require("cors");
const { response, request } = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const app = express();
const Jwt = require('jsonwebtoken');

// app.use(express.json('JsonWebToken'))
app.use(express.json())

const jwtKey = 'e-comm';



app.use(express.urlencoded({ extended: true }))
// app.post(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));

// app.post('/register', async (req, res) => {
//     const { name, email, password } = req.body
//     if (!name || !email || !password) {
//         return res.status(400).json({ error: "please add all the feilds" })
//     } else {
//         let user = await User.create({ name, email, password })
//         return res.send(user);
//     }
// })

app.post('/register', async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({ user }, jwtKey, { expiresIn: "2hr" }, (err, token) => {
        if (err) {
            res.send({ result: "something went wrong , please try after some time" })
        }
        res.send({ result, auth: token })
    })
})







app.post("/login", async (req, res) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "something went wrong" })
                }
                res.send({ user, auth: token })
            })

        } else {
            res.send({ result: "No user Found" })
        }
    }
    else {
        res.send({ result: "no user found" })
    }
});

app.post("/add-product", verifyToken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result)
});
app.get("/products", verifyToken ,async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        res.send(products)
    } else {
        res.send({ result: "No Products found" })
    }
});

app.delete("/product/:id",verifyToken, async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result);
});

app.get("/product/:id",verifyToken, async (req, res) => {

    try {
        console.log("hello", req)
        let result = await Product.findById({ _id: req.params.id });
        if (result) {
            res.send(result)
        } else {
            res.send({ result: "No Record found" })
        }
    } catch (error) {
        console.log(error.message)
    }
   
})

app.put("/product/:id",verifyToken, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    res.send(result)
})

app.get("/search/:key", verifyToken, async (req, res) => {
    let result = await Product.find({
        "$or": [
            {
                 name: { $regex: req.params.key } 
                },
            { 
                company: { $regex: req.params.key } 
            },
            { 
                category: { $regex: req.params.key } 
            }
        ]
    });
    res.send(result)
})

function verifyToken(req, res ,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        Jwt.verify(token , jwtKey, (err ,valid) =>{
            if(err){
                res.status(401).send({result : "Please provide valid token"})
        }else{
            next();
        }

        })
    }else{
        res.status(403).send({result:"Please add token with header"})
    }
    console.warn("middleware called", token)
    
}

app.listen(8000);