const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
dotenv.config();

const createToken = (token) =>{
    return jwt.sign(token,process.env.JWT_SECRET)
}

const verifyToken = (token) =>{
    return jwt.verify(token,process.env.VERYFY_JWT_SECRET)
}

const hashPassword = (password) =>{
    return bcrypt.hash(password,10)
}

const comparePassword = (password,hash) =>{
    return bcrypt.compareSync(password,hash)
}

module.exports = {createToken , verifyToken , hashPassword , comparePassword}