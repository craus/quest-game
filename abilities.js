Abilities = {
  look: {
    name: "Look",
    targetCount: 1,
    cast: function() {
      this.targets[0].select()
    }
  },
  skipMove: {
    name: "Skip move",
    targetCount: 0,
    cast: function() {
      this.unit.endMove()
    }
  },  
  hit: {
    name: "Hit",
    targetCount: 1,
    cast: function() {
      this.targets[0].select()
    }
  },

}
Object.keys(Abilities).forEach(k => {
  var abilityParams = Abilities[k]
  Abilities[k] = function(params) {
    return ability(Object.assign(abilityParams, {
      type: k
    }, params))
  }
})