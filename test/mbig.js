var test = require('tape')
var multiSort = require('../')
var collect = require('collect-stream')
var { Readable } = require('stream')
var nextTick = process.nextTick
var { randomBytes } = require('crypto')

test('mbig', function (t) {
  t.plan(2)
  var n = 10
  var streams = [], data = [], combined = []
  for (var i = 0; i < n; i++) {
    streams.push(Readable({ objectMode: true, read: () => {} }))
    data[i] = []
    for (var j = 0; j < 100; j++) {
      var n = Math.floor(1+Math.random()*100)
      var buf = randomBytes(n)
      data[i].push(buf)
      combined.push(buf)
    }
    data[i].sort(cmp)
  }
  combined.sort(cmp)
  collect(multiSort(streams, cmp), { encoding: 'object' }, function (err, rows) {
    t.error(err)
    t.deepEqual(combined, rows)
  })
  streams.forEach(function (stream,i) {
    ;(function next(j) {
      if (j === data[i].length) return stream.push(null)
      stream.push(data[i][j])
      if (Math.random() < 0.1) {
        setTimeout(() => next(j+1), Math.random()*100+1)
      } else nextTick(next, j+1)
    })(0)
  })
})

function cmp(a,b) { return Buffer.compare(a,b) }
