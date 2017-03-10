unit = (params={}) => {
  var panel = instantiate('unitSample')
  $('.units').append(panel)

  var name = params.name || (() => {
    var name = names.rnd()
    for (var i = 0; i < 100; i++) {
      if (units.every(x => x.name != name)) {
        break
      }
      name = names.rnd()
    }
    return name
  })()
  
  params.mana = params.mana || 0
  params.maxMana = params.maxMana || 0
  
  var unit = Object.assign({
    name: name,
    alive: function() { return this.hp > 0 },
    deselect: function() {
    },
    select: function() {
    },
    status: function() {
      return "Alive"
    },
    paint: function() {
      setFormattedText(panel.find('.hp'), this.hp)
      setFormattedText(panel.find('.maxHp'), this.maxHp)
      setFormattedText(panel.find('.mana'), this.mana)
      setFormattedText(panel.find('.maxMana'), this.maxMana)
      setProgress(panel.find('.hpBar'), this.hp, this.maxHp, {text: this.hp})
      setProgress(panel.find('.manaBar'), this.mana, this.maxMana, {text: this.mana})
      if (this == selectedUnit) {
        setFormattedText($('.selectedUnit.name'), this.name)
        setFormattedText($('.selectedUnit.hp'), this.hp)
        setFormattedText($('.selectedUnit.mana'), this.mana)
        setFormattedText($('.selectedUnit.maxHp'), this.maxHp)
        setFormattedText($('.selectedUnit.maxMana'), this.maxMana)
        setProgress($('.selectedUnit.hpBar'), this.hp, this.maxHp, {text: this.hp})
        setProgress($('.selectedUnit.manaBar'), this.mana, this.maxMana, {text: this.mana})
      }
    },
    save: function() {
      savedata.units.push(Object.assign({
      }, _.omit(this)))
    },
    destroy: function() {
      panel.remove()
      units.splice(units.indexOf(this), 1)
    }
  }, params)
  
  setFormattedText(panel.find('.name'), unit.name)
  return unit
}