var test = require('tape')
var multiSort = require('../')
var collect = require('collect-stream')
var { Readable } = require('stream')

test('multi', function (t) {
  t.plan(2)
  var a = Readable.from([5,10,15])
  var b = Readable.from([3,20,50,55])
  var c = Readable.from([17,25])
  collect(multiSort([a,b,c]), { encoding: 'object' }, function (err, rows) {
    t.error(err)
    t.deepEqual(rows, [3,5,10,15,17,20,25,50,55])
  })
})
