const express = require('express')
require('./db/config');
const User = require("./db/User");
const cors = require("cors");

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.post(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ error: "please add all the feilds" })
    } else {
        let user = await User.create({ name, email, password })
        return res.send(user);

    }
    // console.log(req.body)
    // let result = await user.save();

})

app.listen(8000);