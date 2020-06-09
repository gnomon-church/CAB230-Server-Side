var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})


/* GET stocks from database (filtered by industry) */
router.get('/stocks/symbols', function (req, res, next) {
  if (!('industry' in req.query)) {
    if (Object.keys(req.query).length === 0) {
      req.db
        .from('stocks')
        .select('name', 'symbol', 'industry')
        .then((rows) => {
      res.json(rows)
    })
    } else {
      res.status(400).json({ error: 'true', message: 'Invalid query parameter: only \'industry\' is permitted' })
    }
  } else {
    req.db
    .from('stocks')
    .select('name', 'symbol', 'industry')
    .where('industry', 'like', '%'+req.query.industry+'%')
    .then((rows) => {
      if (rows.length === 0) {
        res.status(404).json({ error: 'true', message: 'Industry sector not found' })
      } else {
        res.json(rows)
      }
    })
  }
})

/* GET stocks from database (by symbol) */
router.get('/stocks/:StockSymbol', function (req, res, next) {
  if (Object.keys(req.query).length !== 0) {
    res.status(400).json({ error: 'true', message: 'Date parameters only available on authenticated route /stocks/authed' })
  } else {
    req.db
    .from('stocks')
    .select('timestamp', 'symbol', 'name', 'industry', 'open', 'high', 'low', 'close', 'volumes')
    .whereRaw('symbol = BINARY ?', [req.params.StockSymbol])
    .then((rows) => {
      if (rows.length === 0) {
        res.status(404).json({ error: 'true', message: 'No entry for symbol in stocks database' })
      } else {
        res.json(rows[0])
      }
    })
  }
})



router.get('/api/city/:CountryCode', function (req, res, next) {
  req.db
    .from('city')
    .select('*')
    .where('CountryCode', '=', req.params.CountryCode)
    .then((rows) => {
      res.json({ Error: false, Message: 'Success', Cities: rows })
    })
    .catch((err) => {
      console.log(err)
      res.json({ Error: true, Message: 'Error in MySQL query' })
    })
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
