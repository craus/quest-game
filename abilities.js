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
    description: function() {
      return "Damage #{0}\u2014#{1}".i(this.damage.a, this.damage.b)
    },
    cast: function() {
      this.targets[0].receiveDamage(rndInt(this.damage.a, this.damage.b))
      this.unit.endMove()
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