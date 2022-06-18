var multiSort = require('../')
var { Readable, Transform, pipeline } = require('stream')
var a = Readable.from([5,10,15])
var b = Readable.from([3,20,50,55])
var c = Readable.from([17,25])

pipeline(
  multiSort([a,b,c], (a,b) => a < b ? -1 : +1),
  Transform({
    writableObjectMode: true,
    transform: (row,enc,next) => next(null, JSON.stringify(row)+'\n'),
  }),
  process.stdout,
  (err) => { if (err) console.error(err) }
)
