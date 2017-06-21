var merry = require('merry')
var level = require('level')
var Resource = require('./lib/resource')
var Model = require('./lib/factory')
var Nanostack = require('nanostack')

var app = merry()
var stack = Nanostack()
// push to middleware
stack.push(function timeElapsed (ctx, next) {
  if (ctx.req.method === 'GET' && ctx.params.id === 'fake') {
    console.error('fake request')
    next({ code: 500, message: 'What are you doing?' })
  } else {
    next()
  }
})
var resource = Resource(app, stack)
var db = process.env.ENV !== 'production'
        ? require('memdb')() : level(process.env.DB)
var Post = Model(db, 'post')
var opt = {
  version: 1,
  path: 'post'
}

resource(Post, opt)

app.route('default', function (req, res, ctx) {
  ctx.send(404, { message: 'nada butts here' })
})

module.exports = app
