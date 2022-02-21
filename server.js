require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');

const app = express();
const { UrlCollect } = require('./mongo.js');

app.use(bodyParser.urlencoded({extended: true}))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// API endpoint urlshortener
app.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;
  // return error if invalid url
  if(!validUrl.isWebUri(original_url)){
    return res.json({
      error: 'invalid url'
    })
  };
  // find url return json with original url and short url
  UrlCollect.findOne({original_url}, async (err, data) => {
    if(err) return console.log(err);
    let ori_url = undefined;
    let short_url = undefined;
    
    if(data){
      ori_url = data.original_url
      short_url = data.short_url
      // console.log('data', data)
    } else {
      const shortId = nanoid(10)
      const existShortId = await UrlCollect.findOne({short_url: shortId})
      if(existShortId){
        ori_url = existShortId.original_url
        short_url = existShortId.short_url
        // console.log('exist id', existShortId)
      } else {
        const newUrl = new UrlCollect({
          original_url: original_url,
          short_url: shortId
        })
        await newUrl.save()
        ori_url = newUrl.original_url
        short_url = newUrl.short_url
        // console.log('new', newUrl)
      }
    }
    return res.json({
      original_url: ori_url,
      short_url: short_url
    })
  })
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  UrlCollect.findOne({short_url}, (err, data) => {
    if(err) return console.log(err);
    if(data){
      res.redirect(301, data.original_url);
    } else {
      console.log("not document found !")
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
