const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


/* POST register new user */
router.post('/register', function (req, res) {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: 'true', message: 'Request body incomplete - email and password needed' })
  } else {
    req.db
      .from('users')
      .select('*')
      .where('email', '=', req.body.email)
      .then((users) => {
        if (users.length > 0) {
          res.status(409).json({ error: true, message: 'User already exists!' });
        } else {
          const saltRounds = 10;
          const hash = bcrypt.hashSync(req.body.password, saltRounds);

          req.db.from('users').insert({ email: req.body.email, hash: hash }).then(res.status(201).json({ success: 'true', message: 'User created' }))
        }
      })
  }
})

/* POST login current user */
router.post('/login', function (req, res) {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: 'true', message: 'Request body invalid - email and password are required' })
  } else {
    req.db
      .from('users')
      .select('*')
      .where('email', '=', req.body.email)
      .then((users) => {
        if (users.length === 0) {
          res.status(401).json({ error: true, message: 'Incorrect email or password' });
          return
        } else {
          return bcrypt.compare(req.body.password, users[0].hash)
        }
      })
      .then((match) => {
        console.log(match)
        if (!match) {
          res.status(401).json({ error: true, message: 'Incorrect email or password' });
        } else {
          const secretKey = 'a very secret key that nobody knows';
          const expireIn = 60 * 60 * 24; // Expiry time of one day
          const exp = Date.now() + expireIn * 1000;
          const token = jwt.sign({ email: req.body.email, exp: exp }, secretKey)
          res.status(200).json({ token: token, token_type: 'Bearer', expires_in: expireIn })
        }
      })      
  }
})


module.exports = router
