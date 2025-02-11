const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FolderSchema = new Schema({
    id: mongoose.Types.ObjectId,
    userId: {
        type: String,
        unique: true,
        require: true
    }, 
    video: {
        type: String,
        required: false,
        default: "NAN"
    },
    videoCreationTime: {
        type: Date,
        required: false,
        default: Date.now()
    },
    messages: [{
        sendBy: String,
        body: String,
        sendAt: Date
    }],
    record: {
        type: String,
        required: false,
        default: "NAN"
    },
    recordedAt: {
        type: Date,
        required: false,
        default: Date.now()
    }, 
    comment: {
        type: String,
        required: false,
        default: "RAS"
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("FolderModel", FolderSchema);
