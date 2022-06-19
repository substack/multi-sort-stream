var test = require('tape')
var multiSort = require('../')
var collect = require('collect-stream')
var { Readable } = require('stream')
var nextTick = process.nextTick
var { randomBytes } = require('crypto')

test('single', function (t) {
  t.plan(2)
  var stream = Readable({ objectMode: true, read: () => {} })
  var data = []
  for (var i = 0; i < 1000; i++) {
    var n = Math.floor(1+Math.random()*100)
    data.push(randomBytes(n))
  }
  data.sort((a,b) => Buffer.compare(a,b))
  collect(multiSort([stream]), { encoding: 'object' }, function (err, rows) {
    t.error(err)
    t.deepEqual(rows, data)
  })
  ;(function next(i) {
    if (i === data.length) return stream.push(null)
    stream.push(data[i])
    nextTick(next, i+1)
  })(0)
})
