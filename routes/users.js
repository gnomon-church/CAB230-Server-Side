var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');


router.post('/register', function (req, res) {
  // console.log('-----------------------------');
  // console.log('here');
  // console.log('-----------------------------');
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


router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})

router.post('/api/update', (req, res) => {
  if (!req.body.City || !req.body.CountryCode || !req.body.Pop) {
    res.status(400).json({ message: 'Error updating population' })
    console.log('Error on request body: ', JSON.stringify(req.body))
  } else {
    const filter = { Name: req.body.City, CountryCode: req.body.CountryCode }
    const pop = { Population: req.body.Pop }

    req
      .db('city')
      .where(filter)
      .update(pop)
      .then((_) => {
        res.status(201).json({ message: `Successful update ${req.body.City}` })
        console.log('successful population update: ', JSON.stringify(filter))
      })
      .catch((_) => {
        res.status(500).json({ message: 'Database error - not updated' })
      })
  }
})

module.exports = router
