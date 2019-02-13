const express = require('express');
const router = express.Router();
const newsfeed = require('../models/news'); // must create a model schema 

// Generating a random number
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
//
// testing another way to upload
const multer = require('multer'); // module to handle file upload
// setting up the storage and the filename plus the extension by giving it a date+filename
const storage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null, './uploads/');
    },
    filename: function(req,file,cb) {
        cb(null, new Date().toISOString() + getRandomInt(99999999999) + file.originalname);
    }
});
const upload = multer({storage: storage});
//const uploadAvatar = multer({storage : Storage});
//Router.get is HTTP method to fetch news 
router.get('/', (req,res) => {
    newsfeed.getAllFeeds((err,rss) => {
        if(err) {
            res.json({success:false, message: `Failed to load all lists. Error: ${err}`});
        } 
        else {
            res.write(JSON.stringify({success: true, rss:rss},null,2));
            res.end();       
     }
   });
});
// code to upload images 
router.post('/addNews', upload.single('newsImage'), (req,res,next) =>{  
    if(Error){
        console.log("Error trying to uppload the file");
    } 
    console.log(req.file);
    let newRss = new newsfeed({

        description:  req.body.description,
        category:     req.body.category,
        author:       req.body.author,
        authorAvatar: req.body.authorAvatar,
        newsTitle :   req.body.newsTitle,
        updated :     req.body.updated,
        videoUrl :    req.body.videoUrl,   
        newsImage:    req.file.filename
    });
    console.log(req.file.filename + req.file.mimetype);
    // save it to the database
    newsfeed.addNews(newRss,(err, rss) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new rss feed. Error: ${err}`});
        }
        else
            res.json({success:true, message: "Added news successfully !",    data: rss});
            console.log({success:true, message: "Added news successfully !", data: rss})
    });
});
