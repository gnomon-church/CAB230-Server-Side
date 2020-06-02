const options = {
  client: "mysql",
  connection: {
    host: "localhost",
    user: "root",
    password: "root",
    database: "webcomputing",
  },
};

const knex = require("knex")(options);

  // knex
  //   .from("webcomputing.stocks")
  //   .select("symbol", "name", "industry")
  //   .then((rows) => {
  //     for (row of rows) {
  //       console.log(`${row["symbol"]} ${row["name"]} ${row["industry"]}`);
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     throw err;
  //   })
  //   .finally(() => {
  //     knex.destroy();
  //   });

 
module.exports = (req, res, next) => {
  req.db = knex;
  next();
};
