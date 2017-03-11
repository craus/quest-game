ability = (params={}) => {
  var panel = instantiate('abilitySample')

  params.targetCount = params.targetCount || 0
  params.cost = params.cost || 0
  
  var ability = Object.assign({
    panel: panel,
    targets: [],
    available: function() {
      return this.unit.mana >= this.cost
    },
    deselect: function() {
      panel.removeClass('selected')
    },
    select: function() {
      if (this.targetCount == 0) {
        this.cast()
        return
      }
      this.unit.abilities.each('deselect')
      this.unit.selectedAbility = this
      panel.addClass('selected')
    },
    save: function() {
      return Object.assign({
      }, _.omit(this, 'panel', 'unit', 'targets'))
    },
    paint: function() {
      panel.toggleClass('disabled', this.unit != movingUnit || !this.available())
    },
    description: function() {
      return this.name
    },
    showDescription: function() {
      //$('.abilityDescription').toggle(true)
      setFormattedText($('.abilityDescription'), this.description())
    },
    hideDescription: function() {
      setFormattedText($('.abilityDescription'), '&nbsp;')
      //$('.abilityDescription').toggle(false)
    },
    setTarget: function(x) {
      this.targets.push(x)
      if (this.targets.length == this.targetCount && this.available()) {
        this.cast()
        this.targets = []
      }
    }
  }, params)
  
  ability.cast = ability.cast.bind(ability)
  setFormattedText(panel.find('.name'), ability.name)
  
  panel.click(() => {
    if (!panel.hasClass('disabled')) {
      ability.select()
    }
  })
  panel.hover(() => ability.showDescription(), () => ability.hideDescription())
  
  return ability
}