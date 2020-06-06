var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

/* GET industries from database */

router.get('/stocks/symbols/:StockIndustry', function (req, res, next) {
  req.db
    .from('stocks')
    .select('name', 'symbol', 'industry')
    .where('industry', 'like', '%'+req.params.StockIndustry+'%')
    // .modify(function(queryBuilder) {
    //   // if (req.params.StockIndustry) {
    //     // queryBuilder.where('industry', 'like', '%'+req.params.StockIndustry+'%')
    //     queryBuilder.where('industry', '=', 'Health Care')

    //   // } else {
    //   //   queryBuilder.where('industry', 'like', '%'+req.params.StockIndustry+'%')
    //   // }
    // })
    .then((rows) => {
      res.json(rows)
    })
    .catch((_) => {
      // res.status(400).json({ error: 'true', message: 'Invalid query parameter: only \'industry\' is permitted' })
      res.status(404).json({ error: 'true', message: 'Industry sector not found' })
    })
})

// router.post('/stocks/symbols/:StockIndsutry', (req, res) => {
//   if (!req.params.StockIndustry) {
//     res.status(400).json({ error: 'true', message: 'Invalid query parameter: only \'industry\' is permitted' })
//     console.log('Error on request body: ', JSON.stringify(req.body))
//   } else {
//     const filter = { Industry: req.body.CountryCode }

//     req
//       .db('stocks')
//       .from('stocks')
//       .select('name', 'symbol', 'industry')
//       .where('industry', 'like', '%'+req.params.StockIndustry+'%')
//       .then((rows) => {
//         res.status(200).json(rows)
//       })
//       .catch((_) => {
//         res.status(404).json({ error: 'true', message: 'Industry sector not found' })
//       })
//   }
// })


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
