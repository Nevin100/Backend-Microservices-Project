import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
});

// Hashing the password :
userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        try {
            this.password = await argon2.hash(this.password)
        } catch (error) {
            return next(error)
        }
    }}
)

// Comparing Password : 
userSchema.methods.comparepassword = async function(candidatePassword){
    try {
        return await argon2.verify(this.password, candidatePassword )
    } catch (error) {
        throw error
    }
}

// Indexing the Username:
userSchema.index({username: 'text'});

const User = mongoose.model('User', userSchema)

export default User
