# full-stack

> full-stack project template

## Features

- Exposes a REST API prefixed with `'api/:version'`, like `api/v1`.
- Use merry to serve the api, and bankai for assets.
- Handle environment variables through .env file (remember not to commit the file).
- Use leveldb as database (memdb in development, leveldown in production).
- Use `npm scripts` as task runner.

## Usage

To use it, copy the [savior][savior] script somewhere in your path, then clone 
my [templates][templates], and set the `TEMPLATES` environment variable to the 
path where you cloned the templates. After that, run:

```bash
$ savior full-stack <your-app-name>
```

## How it works

There are two main frames in this stack, the client (frontend) and the api 
(backend).

### Api

The api files remain in the `/api` folder. The folder structure is the following

```
api/
├── lib/
│   ├── factory.js
│   └── resource.js
├── models/
└── index.js
```

Generally, you don't need to modify anything in the `lib` foler, 
the files in there will help you to generate your model instance and the REST 
routes for that model. We will get to that later.

The `models` folder contains your models schemas as json files, just that. 
Be aware that the name of your model file, must be the same that you use later 
to get your model instance.

The `index.js` file is the entry point of your api. It MUST expose (exports) a 
[merry][merry] instance, that will be served by the root index file (the server). 
Here is where you use the lib folder files. First create your models, which are 
[rest-parser][rest-parser] instances with the `factory.js` file, like this:

```js
var Model = require('./lib/factory')
var Post = Model(db, 'post')
```

In the above snippet, `Post` is your model, and `db` is a [levelup][levelup] 
instance (in this example [memdb][memdb] for development and [level][level] for
production). After you define that model, define the REST routes for that model

```js
var Resource = require('./lib/resource')
var merry = require('merry')

var app = merry()
var resource = Resource(app)

resource(Post, opt)
```

As you can see, the `Resource` function expect a merry instance, and returns a 
function that will attach REST routes to your app, by providing a model (`Post` 
in the above example) and a set of options, which can/must be:

- version: can be anything, if not defined will default to 1.
- path: MUST be provided, and be exactly the same that the name of your model 
scheme file
- only: an array of strings, specifying that you only need support for those 
actions, possible actions are: `'create', 'show', 'index', 'update', 'delete'`

Now you are ready to expose a simple, but fully featured REST api. If you need 
specific logic for certain routes, just define them as you would with any other 
merry app.

### client

The client source code of the app lives in the `/src` folder, the folder 
structure is the following:

```
src/
├── assets/
├── store/
│   ├── actions.js
│   └── reducer.js
├── views/
└── index.js
```

Most of the client is handled by [singleton-router][singleton-router] and 
[redux][redux]. `views/` folder contains views, which are files that expose a 
function that gets as argument the `params` and the redux `store`, and, using 
[bel][bel], return an HTML element. To comunicate with the backend (api), you 
should use the actions from the `store` folder, there is a helper function 
`makeRequest` which use the http module from node to make an xhr request 
(thanks to browserify), anyway, you can replace it for any other xhr/ajax 
library

## FAQ

### How should I handle authentication stuff?

You should use middlewares. In the api, you can pass a [nanostack][nanostack] 
instance to the resource library in your `/api/index.js` file, like this:

```js
var app = merry()
var stack = Nanostack()
// push to middleware
var resource = Resource(app, stack)
```

That's the way to go with middlewares.

### What about production?

For production you can build with `npm run build`, that would use [bankai][bankai] 
to build your frontend, then run your app with the `ENV` variable set to 
`production` like `ENV=production node index.js`. So what's different?

- No loggin in production, only for errors.
- Use level in production instead of memdb.
- All your frontend is minified, thanks to bankai.

### Do you use components?

Components doesn't get included here. If you want components, you should use 
[microcomponent][microcomponent] library.

### And server side rendering?

Let's say you have a component or something you want to server render, then you 
should define it normally in your client and then in your main index file, take 
it and respond with it as a stream when there is an html request, for example:

```js
var fromString = require('from2-string')
var nav = require('./components/nav')
var hyperstream = require('hyperstream')
var http = require('http')
var path = require('path')
var fs = require('fs')

var server = http.createServer(handler)
server.listen(port, ip)

function handler (req, res) {
  var url = req.url
  if (url === '/') {
    serveHtml(res, index)
  }
}

function serveHtml (res, html) {
  htmlStream = fs.createReadStream(path.resolve(__dirname, html))
  navStream = hyperstream({
    'header': fromString(nav.toString())
  })
  htmlStream.pipe(navStream).pipe(res)
}
```

The above snippet take the nav component (a `bel` component) and make a stream 
of it with [from-string][from-string]. Then it uses [hyperstream][hyperstream] to 
make an html stream and pipe it to the response stream.

## Example

In the example folder, there are some sub projects with their own description.

## License

[MIT](/license)

[savior]: https://gist.github.com/YerkoPalma/c9814be639efb165e8445667f36b901e
[templates]: https://github.com/YerkoPalma/templates
[rest-parser]: https://github.com/karissa/node-rest-parser
[memdb]: https://github.com/juliangruber/memdb
[levelup]: https://github.com/level/levelup
[level]: https://github.com/level/level
[singleton-router]: https://github.com/YerkoPalma/singleton-router
[redux]: https://github.com/reactjs/redux
[nanostack]: https://github.com/yoshuawuyts/nanostack
[microcomponent]: https://github.com/yoshuawuyts/microcomponent
[from-string]: https://github.com/yoshuawuyts/from2-string
[hyperstream]: https://github.com/substack/hyperstream
[merry]: https://github.com/shipharbor/merry
[bankai]: https://github.com/yoshuawuyts/bankai
[bel]: https://github.com/shama/bel