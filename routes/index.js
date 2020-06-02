var express = require("express");
var router = express.Router();

/* GET home page. */

router.get("/stocks/symbols", function (req, res, next) {
  req.db.knex
    .from("webcomputing.stocks")
    .select("symbol", "name", "industry")
    .then((rows) => {
      for (row of rows) {
        console.log(`${row["symbol"]} ${row["name"]} ${row["industry"]}`);
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    })
    .finally(() => {
      knex.destroy();
    });
  res.send("test");
});

module.exports = router;
