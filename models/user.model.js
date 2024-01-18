const mongoose =require("mongoose")
const  Schema= mongoose.Schema

const jsonwebtoken =require('jsonwebtoken')
const {sign} = jsonwebtoken

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
   
    phone:{
        type:String,
        minLength: 10,
        maxLength: 10,
        required:true
    },
    email:{
        type:String,
        unique:true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        required:true
    },
    password:{
        type:String,
        required:true,
        select: false
    }
},
{timestamps:true}
)

userSchema.methods.generateAuthToken = function(){
    const token = sign(
        {_id:this._id,role: this.role},
        (process.env.JWT).trim()
    )
    return token;
}

const User = mongoose.model('Users',userSchema)
module.exports=User
