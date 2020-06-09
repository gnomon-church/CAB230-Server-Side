var express = require('express')
var router = express.Router()


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


module.exports = router
