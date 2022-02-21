const mongoose = require("mongoose");

// connect to mongodb use mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true})

const urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true},
})

const UrlCollect = mongoose.model('shortener_url', urlSchema);

exports.UrlCollect = UrlCollect;