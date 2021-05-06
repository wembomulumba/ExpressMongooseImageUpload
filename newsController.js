# Express, Mongodb App
const express = require('express');
const router = express.Router();
const newsfeed = require('../models/news');

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
// similar to post but we add image here (Working well on postman) to upload images also C:\node-8\MEAN-BIGBUNDLE\frontend
// image added successfull , inserted inside the database(Using form from Postman)
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


//GET HTTP method to /news/rss/:id Api to get a specific news news by id
router.get('/rss/:id',(req,res) => {
    let id = req.params.id;
    newsfeed.findNewsById(id,(err, rss)=> {
        if(err) {
            res.json({success:false, message: `Failed to load all news rss. Error: ${err}`});
        }
        else {
            res.write(JSON.stringify(rss,null,2));
            res.end();
      }
    });
});


router.get('/delete/:id', (req,res,next)=> {
    //access the parameter which is the id of the item to be deleted
    let id = req.params.id;
    console.log('deleting...' + id);
    //Call the model method deleteListById
      newsfeed.deleteNewsById(id,(err,rss) => {
          if(err) {
              res.json({success:false, message: `Failed to delete the news. Error: ${err}`});
          }
          else if(rss) {
              res.json({success:true, message: "Deleted successfully news : ID : " + id });
              console.log('deleted : ' + id);
          }
          else
              res.json({success:false});
      });
  });



  
//DELETE HTTP method to /bucketlist. Here, we pass in a param which is the object id.
router.delete('/:id', (req,res,next)=> {
    //access the parameter which is the id of the item to be deleted
      let id = req.params.id;
    //Call the model method deleteListById
    newsfeed.deleteNewsById(id,(err,rss) => {
          if(err) {
              res.json({success:false, message: `Failed to delete the rss. Error: ${err}`});
          }
          else if(rss) {
              res.json({success:true, message: "Deleted successfully the RSS ID : "+ id});
          }
          else
              res.json({success:false});
      })
  });

  // update image avatar for the author or publisher
router.put('/updateAvatar/:id', upload.single('authorAvatar') , (req,res,next) => {
    const imageInput = req.file.filename;
    
    console.log(imageInput);
    // save the image path in our database
    newsfeed.findByIdAndUpdate(req.params.id, {authorAvatar : imageInput}, function (err, post) {
        if (err) {
            return next(err);
        } else {
            res.json(imageInput);
            console.log(post);
        }
        
    });
});

// 2 working better to update any new parameter that is being manipulate
router.put('/update/:id', function(req, res, next) {
    
    const category = req.body.category;
    const newsTitle = req.body.newsTitle;
    const description = req.body.description;

    newsfeed.findByIdAndUpdate(req.params.id, {newsTitle : newsTitle, category: category, description: req.body.description}, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
});
module.exports = router;
