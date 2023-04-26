const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://dheeraj04dec:1234567890@e-commerce.okqdldu.mongodb.net/dheeraj?retryWrites=true&w=majority").then(()=>{
    console.log(`connect`);
})
.catch((error) => {
    console.log(error);
})