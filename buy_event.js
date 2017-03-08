buyEvent = (params={}) => {
  var result = Object.assign({
    available: function() {
      return Object.entries(params.cost).every(c => resources[c[0]]() >= c[1]())
    },
    buy: function() {
      if (!this.available()) {
        return
      }
      Object.entries(params.cost).forEach(c => resources[c[0]].value -= c[1]())
      params.reward()
    },
    paint: function() {
      enable($('.'+params.id), this.available())
      Object.entries(params.cost).forEach(c => {
        setFormattedText($('.#{0} > .cost.#{1}'.i(params.id, resources[c[0]].id)), large(c[1]()))
      })
    }
  }, params)
  $('.'+params.id).click(() => result.buy())
  return result
}