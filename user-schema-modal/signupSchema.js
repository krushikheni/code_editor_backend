const mongoose = require('mongoose')

const SignUpSchema = new mongoose.Schema({
    name:{type : String,require : true},
    email:{type: String,require : true},
    password:{type: String,require : true}
})

const SignUpmodal = mongoose.model('userSignUps',SignUpSchema)

module.exports = SignUpmodal;