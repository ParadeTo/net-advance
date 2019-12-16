export default class Event {
  listeners = {}
  on(type, cb) {
    if (Array.isArray(type)) {
      for (let i = 0, l = type.length; i < l; i++) {
        this.on(type[i], cb)
      }
    } else {
      this.listeners[type] || (this.listeners[type] = []).push(cb)
    }
    return this
  }

  once(type, cb) {
    const on = (action) => {
      this.off(type, on)
      cb.call(this, action)
    }
    on.fn = cb
    this.on(type, on)
    return this
  }

  off(type, cb) {
    if (!arguments.length) {
      this.listeners = Object.create(null)
      return this
    }

    if (Array.isArray(type)) {
      for (let i = 0, l = type.length; i < l; i++) {
        this.off(type[i], cb)
      }
      return this
    }

    const cbs = this.listeners[type]
    if (!cbs) {
      return this
    }
    if (!cb) {
      this.listeners[type] = null
      return this
    }
    if (cb) {
      let _cb
      let i = cbs.length
      while (i--) {
        _cb = cbs[i]
        if (_cb === cb || _cb.fn === cb) {
          cbs.splice(i, 1)
          break
        }
      }
    }
    return this
  }

  emit(action) {
    const { type } = action
    let cbs = this.listeners[type]
    if (cbs) {
      for (let i = 0, l = cbs.length; i < l; i++) {
        cbs[i].call(this, action)
      }
    }
    return this
  }
}
