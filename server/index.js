const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "dgtesdfhfvdsfsdfsf";

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());

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
                res.cookie('token', token).json('ok');
            });
        }
        else
        {
            res.status(400).send('Wrong credentials');
        }

    });

app.listen(4000);

