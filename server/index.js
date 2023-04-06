const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs = require('fs');


const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "dgtesdfhfvdsfsdfsf";

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://Sianuga:q9oCklSvbHZlHpgr@cluster0.h0jthid.mongodb.net/?retryWrites=true&w=majority');



app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const userDoc = await User.create({
         username,
          password: bcrypt.hashSync(password, salt), });
      res.json(userDoc);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  app.post('/login', async (req, res) => {

        const { username, password } = req.body;
        const userDoc = await User.find( {username});
        const passOk = bcrypt.compareSync(password, userDoc[0].password);  
 

        if(passOk)
        {
            jwt.sign({username, id: userDoc[0]._id}, secret, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json({
                  id: userDoc[0]._id,
                  username: username,
                });
            });
        }
        else
        {
            res.status(400).send('Wrong credentials');
        }

    });


app.get('/profile', (req, res) => {

    const {token} = req.cookies;

    jwt.verify(token, secret, (err, info) => {
        if(err) throw err;
        res.json(info);
    });

});

app.post('/logout', (req, res) => {

res.cookie('token', '').json('ok');
});


app.post('/post', uploadMiddleware.single('file') , async (req, res) => {

  const {originalname,path} = req.file;
  const splitName = originalname.split('.');
  const extension = splitName[splitName.length - 1];
  fs.renameSync(path, path + '.' + extension);

  const {token} = req.cookies;
  jwt.verify(token, secret, async (err, info) => {
    if(err) throw err;

    const {title, summary, content} = req.body;
  
  const postDoc = await Post.create({
    title,
    summary,
    content,
    cover: path + '.' + extension,
    author: info.id,
  });
  
  res.json(postDoc);
});

});

app.get('/post', async (req, res) => {
  const posts = await Post.find().populate('author', ['username']).sort({createdAt: -1}).limit(20);
  res.json(posts);
});

app.get('/post/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', ['username']);
  res.json(post);
});



app.listen(4000);

