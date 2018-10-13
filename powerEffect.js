powerEffect = function(params) {
  return createEffect({
    createdAt: params.createdAt || Time.gametime(),
    power: function() { return params.power * Math.pow(0.5, (Time.gametime()-this.createdAt)/1000/params.decay) },
    paint: function() {
      setFormattedText(this.panel.find(".effectMultiplier"), large(this.effectMultiplier))
      setFormattedText(this.panel.find(".costMultiplier"), large(this.costMultiplier))
    }, 
    save: function() {
      savedata.effects = savedata.effects || []
      savedata.effects.push({
        createdAt: this.createdAt,
        decay: params.decay,
        power: params.power
      })
    }
  })
}