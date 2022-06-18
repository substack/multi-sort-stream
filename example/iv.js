var multiSort = require('../')
var from = require('from2')
var { Transform, pipeline } = require('stream')

var na = 10, nb = 5, nc = 20
var a = from.obj(function (n, next) {
  setTimeout(() => {
    na += 5
    next(null, na)
  }, 1000)
})
var b = from.obj(function (n, next) {
  setTimeout(() => {
    nb += 3
    next(null, nb)
  }, 200)
})
var c = from.obj(function (n, next) {
  setTimeout(() => {
    nc += 2
    next(null, nc)
  }, 400)
})

pipeline(
  multiSort([a,b,c]),
  Transform({
    writableObjectMode: true,
    transform: (row,enc,next) => next(null, JSON.stringify(row)+'\n'),
  }),
  process.stdout,
  (err) => { if (err) console.error(err) }
)
