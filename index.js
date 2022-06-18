var from = require('from2')

module.exports = function (streams, opts) {
  if (typeof opts === 'function') opts = { compare: opts }
  if (!opts) opts = {}
  var cmp = opts.compare ?? defaultCompare
  var buckets = Array(streams.length).fill(null)
  var alive = streams.length
  var end = Array(streams.length).fill(false)
  var readSize = null, readNext = null
  var need = streams.length
  var errors = []
  streams.forEach(function (stream,i) {
    stream.on('readable', check)
    stream.once('end', onend)
    stream.on('error', function (err) {
      errors.push(err)
      check()
    })
    function onend() {
      if (end[i]) return
      end[i] = true
      if (buckets[i] === null) {
        need--
      }
      alive--
      check()
    }
  })
  return from.obj(read)

  function read(size, next) {
    if (errors.length > 0) return next(errors.shift())
    if (need === 0 && alive === 0) return next(null, null)
    if (need === 0) return push(next)
    for (var i = 0; i < buckets.length; i++) {
      if (end[i]) continue
      if (buckets[i] === null) {
        var x = streams[i].read()
        if (x !== null) {
          buckets[i] = x
          need--
        }
      }
    }
    if (need === 0) push(next)
    else {
      readSize = size
      readNext = next
    }
  }
  function push(next) {
    for (var li = 0; buckets[li] === null && li < buckets.length; li++) {}
    var least = buckets[li]
    for (var i = li+1; i < buckets.length; i++) {
      if (buckets[i] === null) continue
      if (cmp(buckets[i],least) < 0) {
        least = buckets[i]
        li = i
      }
    }
    if (!end[li]) need++
    buckets[li] = null
    next(null, least)
  }
  function check () {
    if (readNext !== null) {
      var size = readSize
      var next = readNext
      readSize = null
      readNext = null
      read(size, next)
    }
  }
}

function defaultCompare(a,b) { return a < b ? -1 : +1 }
