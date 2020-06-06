require("dotenv").config()
const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const options = require("./knexfile.js")
const knex = require("knex")(options)
const helmet = require("helmet")
const cors = require("cors")
const swaggerUI = require("swagger-ui-express")
const swaggerDocument = require("./docs/swaggerpet.json")

const indexRouter = require("./routes/index")
const usersRouter = require("./routes/users")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("common"))
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use((req, res, next) => {
  req.db = knex
  next()
})

logger.token("req", (req, res) => JSON.stringify(req.headers))
logger.token("res", (req, res) => {
  const headers = {}
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)))
  return JSON.stringify(headers)
})

app.use("/", indexRouter)
app.use("/users", usersRouter)
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.get("/knex", (req, res, next) => {
  req.db
    .raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err)
      throw err
    })
  res.send("Version logged successfully")
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
