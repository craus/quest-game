unit = (params={}) => {
  var panel = instantiate('unitSample')
  $('.units').append(panel)
  var abilitiesPanel = instantiate('unitAbilitiesListSample')
  $('.abilities').append(abilitiesPanel)

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
  params.abilities = params.abilities || []
  params.abilities = params.abilities.map(a => Abilities[a.type](a))
  
  var unit = Object.assign({
    name: name,
    selectedAbility: null,
    alive: function() { return this.hp > 0 },
    deselect: function() {
      panel.removeClass('selected')
      abilitiesPanel.removeClass('in active')
    },
    select: function() {
      units.each('deselect')
      panel.addClass('selected')
      abilitiesPanel.addClass('in active')
      selectedUnit = this
    },
    endMove: function() {
      panel.removeClass('mover')
      var next = units.cyclicNext(this)
      next.startMove()
      next.select()
    },
    startMove: function() {
      panel.addClass('mover')
      movingUnit = this
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
      this.abilities.each('paint')
    },
    save: function() {
      savedata.units.push(Object.assign({
      }, _.omit(this, 'abilities', 'selectedAbility'), {
        abilities: this.abilities.map(a => a.save()),
        selectedAbilityIndex: this.abilities.indexOf(this.selectedAbility)
      }))
    },
    destroy: function() {
      panel.remove()
      units.splice(units.indexOf(this), 1)
    }
  }, params)
  
  unit.abilities.forEach(a => {
    a.unit = unit
    abilitiesPanel.append(a.panel)
  })
  
  unit.selectedAbility = unit.abilities[unit.selectedAbilityIndex]
  if (!!unit.selectedAbility) {
    unit.selectedAbility.select()
  }
  
  setFormattedText(panel.find('.name'), unit.name)
  panel.click(() => {
    if (!!movingUnit.selectedAbility) {
      movingUnit.selectedAbility.setTarget(unit)
    }
  })
  return unit
}