const mongoose = require('mongoose');

const {Schema} = mongoose;

const UserSchema = Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    profiles:[
        {
            url:String,
            name:String,
        }
    ],
    current_profile:{
        name:String,
        url:String,
    }
})


exports.User = mongoose.model("User",UserSchema);
