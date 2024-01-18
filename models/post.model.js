const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

postSchema.plugin(mongoosePaginate);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
