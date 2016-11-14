# aioc

> Another inversion of control (IoC) container for Node.js applications
> inspired by the awesome [compact-ioc](https://github.com/rand0me/node-compact-ioc).

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Installation

```
npm install aioc --save
```

## Example usage

```js
// foo.js
class Foo {
  sayFoo () {
    console.log('foo')
  }
}
exports = module.exports = Foo
exports['@factory'] = () => new Foo
```

```js
// bar.js
class Bar {
  sayBar () {
    console.log('bar')
  }
}
exports = module.exports = Bar
exports['@factory'] = () => new Bar
```

```js
// foobar.js
class Foobar {
  constructor (foo, bar) {
    this.foo = foo
    this.bar = bar
  }
  sayFoobar () {
    this.foo.sayFoo()
    this.bar.sayNar()
  }
}
exports = module.exports = Foobar
exports['@deps'] = ['foo', 'bar']
exports['@factory'] = ([foo, bar]) => new Bar(foo, bar)
```

```js
// ioc.js
const AIOC = require('aioc')

module.exports = AIOC()
  .pub('foo', './foo')
  .pub('bar', './bar')
  .pub('foobar', './foobar')
```

```js
// index.js
const ioc = require('./ioc')

ioc.get('foobar')
  .sayFoobar()

// $ node index.js
// foo
// bar
```

## Api

### constructor (opts)

Create a new IOC container.

#### options

##### depsKey

A `string` to specify the dependencies key.

Defaults to :
[`aioc.defaultDepsKey`](https://github.com/enten/aioc/blob/master/index.js#L89) = `"@deps"`

##### factoryKey

A `string` to specify the factory key.

Defaults to :
[`aioc.defaultFactoryKey`](https://github.com/enten/aioc/blob/master/index.js#L90) = `"@factory"`

### applyArgs (name, args)

Declares arguments which will be passed to the factory of the `name` dependency.

```javascript
// foo.js
class Foo {
  constructor (args) {
    console.log(args)
  }
}
exports = module.exports = Foo
exports['@factory'] = (deps, args) => new Foo(args)

// index.js
const ioc = new AIOC

ioc.pub('foo', './foo')
ioc.applyArgs('foo', ['foo', 'bar'])

const Foo = ioc.get('foo')

// $ node index.js
// ['foo', 'bar']
```

#### name

A `string` to specify a dependency key.

#### args

An array used when the dependency fatory will be called

### callArgs (name, ...args)

Alias to `applyArgs(name, args)`.

### flush (name)

Remove a dependency instance from the cache.

```javascript
ioc.flush('foo')
```

#### name

A `string` to specify a dependency key.

### get (name)

Get a dependency.

```javascript
// index.js
const ioc = new AIOC

ioc.pub('foo', './foo')

const Foo = ioc.get('foo')
```

#### name

A `string` to specify a dependency key.

### pub (name, path)

Publish a new dependency.

Example :

```javascript
ioc.pub('foo', './foo')
```

#### name

A `string` to specify a key which identify the new dependency.

#### path

A `string` to specify a path to the new dependency.

### unpub (name)

Unpublish a dependency.

Example :

```javascript
ioc.unpub('foo')`
```

### use (name, ...args)

MIT
