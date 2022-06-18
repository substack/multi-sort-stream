# multi-sort-stream

merge multiple sorted streams into a single sorted stream

# example

``` js
var multiSort = require('multi-sort-stream')
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
```

output:

```
3
5
10
15
17
20
25
50
55
```

# api

``` js
var multiSort = require('multi-sort-stream')
```

## var stream = multiSort(streams, opts)

Create a readable `stream` of sorted output from an array of sorted readable `streams`.

* `opts.compare(a,b)` - comparison function (return -1 or +1)

If `opts` is a function, it will be used as the `opts.compare` function.

# install

```
npm install multi-sort-stream
```

# license

bsd

