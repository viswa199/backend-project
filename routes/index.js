const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const {User} = require('../models/User');
const { application } = require('express');

AWS.config.update({
  accessKeyId:process.env.ACCESS_KEY,
  secretAccessKey:process.env.SECRET_ACESS_KEY,
  region:'ap-south-1'
})

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>{
  var url,name;
  User.findOne({username:req.user.username})
  .then((user)=>{
    if(user.current_profile!={}){
      url = user.current_profile.url;
      name = user.current_profile.name;
    }else{
      url=process.env.PROFILE_URL;
      name='default profile';
    }
    res.render('dashboard', {
      username: req.user.username,
      url:url,
      name:name,
    })
  })
});

//file upload middleware
const storage = multer.memoryStorage();
const upload = multer({storage:storage})

router.post('/dashboard',upload.single('profile'), async (req,res,next)=>{
  let errors=[];
  const file = req.file;
  if(!file){
    res.status(400).send('You have not uploaded file')
  }

  const s3 = new AWS.S3();
  const params = {
    Bucket:'vathi',
    Key:req.file.originalname,
    Body:req.file.buffer,
    ACL:'public-read',
  }
  
  s3.upload(params,function(err,data){
    if(err){res.status(400).send(`problem upload photo: ${err}`)}
    
    var query={username:req.user.username}
    User.findOne(query)
    .then(user=>{
      profiles=user.profiles;
      profiles.push({url:data.Location,name:data.Key})
      user.current_profile={url:data.Location,name:data.key}
      user.save()
    })
    res.render('dashboard',{url:data.Location,name:data.Key,username:req.user.username});
  })
})

router.get('/dashboard/myprofiles',ensureAuthenticated,(req,res)=>{
  User.findOne({username:req.user.username})
  .then((user)=>{
    console.log(user.profiles)
    profiles=user.profiles
    res.render('profiles',{profiles:profiles})
  })
})


module.exports = router;
