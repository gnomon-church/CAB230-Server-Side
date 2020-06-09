const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


/* GET stocks from database (filtered by industry) */
router.get('/symbols', function (req, res, next) {
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
      .where('industry', 'like', '%' + req.query.industry + '%')
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
router.get('/:StockSymbol', function (req, res, next) {
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

/* Handle JWT authorisation */
const authorise = (req, res, next) => {
  let token = null;
  const secretKey = 'a very secret key that nobody knows'

  if (req.headers.authorization && req.headers.authorization.split(' ').length === 2) {
    token = req.headers.authorization.split(' ')[1]

    try {
      const decoded = jwt.verify(token, secretKey);
      if (decoded.exp < Date.now()) {
        res.status(403).json({ error: 'true', message: 'Authorization header not found' })
      } else {
        next();
      }
    } catch (err) {
      res.status(403).json({ error: 'true', message: 'Authorization header not found' })
    }

  } else {
    res.status(403).json({ error: 'true', message: 'Authorization header not found' })
  }
}


/* GET stocks from database (by symbol) (authed) (opt: filter by date) */
router.get('/authed/:StockSymbol', authorise, function (req, res, next) {
  const validQueries = ['to', 'from']

  if (('to' in req.query) || ('from' in req.query) || Object.keys(req.query).length === 0) {
    let filterTo
    let filterFrom

    if (!('to' in req.query)) {
      filterTo = new Date(Date.now()).toISOString();
    } else {
      filterTo = req.query.to;
    }

    if (!('from' in req.query)) {
      filterFrom = new Date(0000, 00, 00, 00, 00, 00, 0)
    } else {
      filterFrom = req.query.from;
    }
    
    req.db
      .from('stocks')
      .select('timestamp', 'symbol', 'name', 'industry', 'open', 'high', 'low', 'close', 'volumes')
      .whereRaw('symbol = BINARY ? AND timestamp > ? AND timestamp <= ?', [req.params.StockSymbol, filterFrom, filterTo])
      .then((rows) => {
        if (rows.length === 0) {
          res.status(404).json({ error: 'true', message: 'No entries available for query symbol for supplied date range' })
        } else {
          res.json(rows)
        }
      })
    } else {
      res.status(400).json({ error: 'true', message: 'Parameters allowed are \'from\' and \'to\', example: /stocks/authed/AAL?from=2020-03-15' })
    }
  
  
})

module.exports = router
