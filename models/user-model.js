const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: mongoose.Types.ObjectId,
    username: {
        type: String,
        unique: true,
        require: true,
        match: /^[a-z0-9]{5,}$/ig
    }, 
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 1,
        required: true
    },
    password: {
        type: String,
        default: "00000",
        match: /^[a-z0-9]{5,}$/ig
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("UserModel", UserSchema);
