var { Readable } = require('stream')
module.exports = MultiSort

function MultiSort(streams, opts) {
  var self = this
  if (!(self instanceof MultiSort)) return new MultiSort(streams, opts)
  Readable.call(self, { objectMode: true })
  if (!opts) opts = {}
  if (typeof opts === 'function') opts = { compare: opts }
  self._streams = streams
  self._compare = opts.compare != null ? opts.compare : defaultCompare

  self._buckets = Array(streams.length).fill(null)
  self._end = Array(streams.length).fill(false)
  self._gets = Array(streams.length).fill(null)

  streams.forEach(function (stream, i) {
    stream.once('end', function () {
      self._end[i] = true
      var f = self._gets[i]
      if (f) {
        self._gets[i] = null
        f(null, null, i)
      }
    })
    stream.on('readable', function () {
      var f = self._gets[i]
      if (!f) return
      var x = stream.read()
      if (x === null) {
        self._end[i] = true
      }
      var f = self._gets[i]
      self._gets[i] = null
      f(null, x, i)
    })
  })
}
MultiSort.prototype = Object.create(Readable.prototype)

MultiSort.prototype._get = function (i, cb) {
  var self = this
  var x = self._streams[i].read()
  if (x !== null) return cb(null, x, i)
  if (self._end[i]) return cb(null, x, i)
  if (self._gets[i]) throw new Error(`already waiting on ${i}`)
  self._gets[i] = cb
}

MultiSort.prototype._read = function (size) {
  var self = this
  self._fill(function (err) {
    if (err) return self.emit('error', err)
    var least = null, li = -1
    for (var i = 0; i < self._buckets.length; i++) {
      var b = self._buckets[i]
      if (b === null) continue
      if (li < 0 || self._compare(b,least) < 0) {
        least = b
        li = i
      }
    }
    if (li >= 0) self._buckets[li] = null
    self.push(least)
  })
}

MultiSort.prototype._fill = function (cb) {
  var self = this
  var pending = 1
  for (var i = 0; i < self._streams.length; i++) {
    if (self._end[i]) continue
    if (self._buckets[i] === null) {
      pending++
      self._get(i, onget)
    }
  }
  if (--pending === 0) cb()

  function onget(err, x, i) {
    if (err) {
      var f = cb
      cb = noop
      return f(err)
    }
    self._buckets[i] = x
    if (--pending === 0) cb()
  }
}

function defaultCompare(a,b) { return a < b ? -1 : +1 }
function noop() {}
