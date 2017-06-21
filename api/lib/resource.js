var path = require('path')

function resource (app, stack) {
  return function (model, opt) {
    var prefix = '/api/v' + (opt.version || '1')
    var route = opt.path
    // index, create
    app.route(['GET', 'POST'], path.join(prefix, route), handler)
    // show, update, delete
    app.route(['GET', 'PUT', 'DELETE'], path.join(prefix, route, '/:id'), handler)

    if (opt.overwrite) {
      app.route(opt.overwrite.method, opt.overwrite.route, opt.overwrite.handler)
    }

    function handler (req, res, ctx) {
      if (stack && stack._middleware.length > 0) {
        ctx.req = req
        ctx.res = res
        stack.walk(ctx, function (err, data, next) {
          if (err) throw err
          dispatch(req, res, ctx)
        })
      } else {
        dispatch(req, res, ctx)
      }
    }
    function dispatch (req, res, ctx) {
      model.dispatch(req, Object.assign({ valueEncoding: 'json' }, ctx.params), function (err, data) {
        if (err) {
          if (err.notFound) {
            ctx.send(404, { message: 'resource not found' })
          } else {
            ctx.send(500, { message: 'internal server error' })
          }
        } else {
          if (!data) {
            if (req.method !== 'DELETE') {
              ctx.send(404, { message: 'resource not found' })
            } else {
              ctx.send(200, { id: ctx.params.id }, { 'content-type': 'json' })
            }
          } else {
            ctx.send(200, JSON.stringify(data), { 'content-type': 'json' })
          }
        }
      })
    }
  }
}
module.exports = resource
