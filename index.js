const {DepGraph} = require('dependency-graph')
const {resolve: resolvePath} = require('path')

class AIOC {
  constructor ({depsKey, factoryKey} = {}) {
    this.args = {}
    this.cache = {}
    this.depsGraph = new DepGraph()
    this.depsKey = depsKey || AIOC.defaultDepsKey
    this.factoryKey = factoryKey || AIOC.defaultFactoryKey
    this.registry = {}
  }

  applyArgs (name, args) {
    this.args[name] = args
    return this
  }

  callArgs (name, ...args) {
    return this.applyArgs(name, args)
  }

  flush (name) {
    delete require.cache[this.registry[name]]
    delete this.cache[name]
    return this
  }

  registerNode (name) {
    if (!this.registry[name]) {
      throw Error(`Dependency does not exists: ${name}`)
    }
    if (!this.depsGraph.hasNode(name)) {
      this.depsGraph.addNode(name, null)
    }
    let factory = this.depsGraph.getNodeData(name)
    if (!factory) {
      const path = this.registry[name]
      const exportsObj = require(path)
      factory = exportsObj[this.factoryKey] || (() => exportsObj)
      if (typeof factory !== 'function') {
        throw Error(`${this.factoryKey} must be a function: ${name} ${path}`)
      }
      const deps = [].concat(exportsObj[this.depsKey] || [])
      this.depsGraph.setNodeData(name, factory)
      deps.forEach((dep) => {
        this.registerNode(dep)
        this.depsGraph.addDependency(name, dep)
      })
    }
    return factory
  }

  get (name) {
    if (this.cache.hasOwnProperty(name)) {
      return this.cache[name]
    }
    if (!this.depsGraph.hasNode(name)) {
      this.registerNode(name)
    }
    const factory = this.depsGraph.getNodeData(name)
    const deps = this.depsGraph.dependenciesOf(name).map((dep) => this.get(dep))
    const mod = factory.apply(this, [deps.concat(this)].concat(this.args[name] || []))
    return (this.cache[name] = mod)
  }

  pub (name, path) {
    if (this.registry[name]) {
      throw Error(`Dependency already exists: ${name}`)
    }
    path = path || name
    path = path.startsWith('.') ? resolvePath(path) : path
    this.registry[name] = require.resolve(path)
    return this
  }

  unpub (name) {
    this.flush(name)
    this.depsGraph.removeNode(name)
    delete this.registry[name]
    return this
  }

  use (name) {
    this.callArgs.apply(this, arguments)
    return this.get(name)
  }
}

AIOC.defaultDepsKey = '@deps'
AIOC.defaultFactoryKey = '@factory'

module.exports = AIOC
// 94!
