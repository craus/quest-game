item = (params={}) => {
  var panel = instantiate('itemSample')
  var tab = instantiate('itemTabSample')
  if (params.instantiate != false) {
    $('.items').append(panel)
    $('.itemTabs').append(tab)
  }
  
  var rndName = () => {
    var name = itemNames.rnd()
    for (var i = 0; i < 100; i++) {
      if (items.every(q => q.name != name)) {
        break
      }
      name = questNames.rnd()
    }
    return name
  }
  var name = params.name || rndName()
  
  var randomness = 0.3 + 0.7 * Math.pow(params.level, 0.3)
  var coolness = gaussianRandom(0, 0.3 * randomness)
  var quality = gaussianRandom(0, 0.3 * randomness)
  var allEffects = {
    defense: 1.5,
    speed: 2,
    wealth: 2,
    intelligence: 2
  }
  var effects = {}
  if (params.effects) {
    effects = params.effects
  } else {
    var effectiveLevel = params.level + coolness + quality
    var effectsCount = Math.clamp(Math.round(gaussianRandom(2, 0.3)), 1, 4)
    var levelSplit = rndSplit(effectiveLevel, effectsCount)
    Object.entries(allEffects).rndSubset(effectsCount).forEach((e, i) => {
      effects[e[0]] = Math.pow(e[1], levelSplit[i])
    })
  }
  
  Object.entries(effects).forEach(e => {
    var effectLine = instantiate('effectLineSample')
    panel.find('.effects').append(effectLine)
    setFormattedText(effectLine.find('.skill'), e[0])
    setFormattedText(effectLine.find('.value'), large(e[1]))
  })
  
  var cost = params.cost || Math.round(10 * Math.pow(2, params.level + coolness))
  
  setFormattedText(panel.find('.cost'), large(cost))
  setFormattedText(tab.find('.cost'), large(cost))
  setFormattedText(panel.find('.name'), name)
  setFormattedText(tab.find('.name'), name)
  setFormattedText(panel.find('.level'), params.level)
  setFormattedText(tab.find('.level'), params.level)
  
  var result = Object.assign({
    name: name,
    cost: cost,
    effects: effects,
    bought: false,
    sellCost: function() {
      return Math.floor(cost/2)
    },
    equipped: function() {
      return !!this.hero
    },
    deselect: function() {
      selectedItem = null
      tab.removeClass('active')
      panel.removeClass('active')
      panel.removeClass('in')
    },
    select: function() {
      if (!!selectedItem) {
        selectedItem.deselect()
      }
      selectedItem = this
      tab.addClass('active')
      panel.addClass('active')
      panel.addClass('in')
    },
    status: function() {
      return "Exists"
    },
    paint: function() {
      panel.find('.buy').toggle(!this.bought)
      enable(panel.find('.buy'), resources.gold() >= this.cost)
      panel.find('.equip').toggle(this.bought && this.hero != selectedHero && selectedHero.items.length < 2)
      panel.find('.unequip').toggle(!!this.hero)
      panel.find('.sell').toggle(this.bought)
      panel.find('.discard').toggle(!this.bought && this.level > 0)
      
      panel.find('.equipped').toggle(this.equipped())
      if (this.equipped()) {
        setFormattedText(panel.find('.heroName'), this.hero.name)
      }
      
      var a = tab.find('a')
      a.toggleClass('equipped', this.equipped() && this.hero != selectedHero)
      a.toggleClass('equippedByCurrent', this.hero == selectedHero)
      a.toggleClass('bought', this.bought && !this.equipped())
    },
    buy: function() {
      resources.gold.value -= this.cost
      this.bought = true
      items.push(item({level: this.level+1}))
    },
    equip: function() {
      this.hero = selectedHero
      selectedHero.items.push(this)
    },
    unequip: function() {
      this.hero.items.remove(this)
      this.hero = null
    },
    sell: function() {
      resources.gold.value += this.sellCost()
      this.destroy()
    },
    discard: function() {
      items.push(item({level: this.level-1}))
      this.destroy()
    },
    save: function() {
      savedata.items.push(Object.assign({
        heroIndex: heroes.indexOf(this.hero)
      }, _.omit(this, 'hero', 'heroIndex')))
    },
    destroy: function() {      
      if (this.equipped()) {
        this.unequip()
      }
      if (selectedItem == this) {
        this.deselect()
      }
      panel.remove()
      tab.remove()
      items.splice(items.indexOf(this), 1)
    }
  }, params)
  
  panel.find('.buy').click(() => result.buy())
  panel.find('.equip').click(() => result.equip())
  panel.find('.unequip').click(() => result.unequip())
  panel.find('.sell').click(() => result.sell())
  panel.find('.discard').click(() => result.discard())
  
  tab.find('a').click(() => result.select())
  return result
}