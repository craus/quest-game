poisson = (params={}) => {
  var result = Object.assign({
    tick: function(t) {
      while (t > 0) {
        var next = PoissonProcess.sample(this.period())
        if (next < t) {
          this.trigger()
        }
        t -= next
      }
    }
  }, params)
  return result
}