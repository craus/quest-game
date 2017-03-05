var spell = function(params) {
  var panel = instantiate('spellSample')
  if (params.place) {
    params.place.replaceWith(panel)
    params.place = null
  } else {
    $('.spells').append(panel)
  }
  
  setFormattedText(panel.find('.name'), params.name)
  setFormattedText(panel.find('.reward'), params.reward)
  setFormattedText(panel.find('.spellPower'), large(params.power))
  setFormattedText(panel.find('.decay'), Format.time(params.decay))
  
  Object.entries(params.cooldowns).forEach(c => {
    var cd = cooldowns[c[0]]
    var duration = c[1]
    var cooldownPanel = instantiate('spellCooldownSample')
    panel.find('.spellCooldowns').append(cooldownPanel)
    setFormattedText(cooldownPanel.find('.name'), cd.Name)
    setFormattedText(cooldownPanel.find('.duration'), duration)
  })

  var spell = Object.assign({ 
    available: function() {
      return Object.entries(params.cooldowns).every(c => cooldowns[c[0]]() == 0)
    },
    cast: function() { 
      if (!this.available()) {
        return
      }
      console.log('cast, available')
      Object.entries(params.cooldowns).forEach(c => cooldowns[c[0]].value = c[1])
      this.action()
    },
    action: function() {
      resources.wisdom.value += this.reward * wisdomMultiplier()
      effects.push(powerEffect({
        power: params.power,
        decay: params.decay
      })) 
    },   
    paint: function() {
      enable(panel.find(".cast"), this.available())
    },
    save: function() {
      savedata.spells = savedata.spells || []
      savedata.spells.push(this)
    },
    onHotKey: function(e) {
      if (e.key == params.hotkey) {
        spell.cast()
      }
    },
    destroy: function() {
      window.removeEventListener("keydown", this.onHotKey)    
    }
  }, params, {
    panel: panel
  })
  panel.find(".cast").click(() => spell.cast())
  window.addEventListener("keydown", spell.onHotKey)
  return spell
}

var createSpell = (() => {
  var names = [
    'Fireball',
    'Headbang',
    'Mind Control',
    'Electric Vortex',
    'Blindness',
    'Blink',
    'Shadow Run',
    'Light Sword',
    'Raise Undead',
    'Levitation',
    'Call of the Wild',
    'Transmute',
    'Force field',
    'Avada Kedavra',
    'Mana Leak',
    'Time Lapse',
    'Clean Hands'
  ]

  var createSpell = function(params) {
    var level = params.level
    var powered = Math.max(0.2, gaussianRandom(3, 1))
    var quality = Math.max(0.2, gaussianRandom(1, 0.05))
    var rewardQuality = Math.max(0.2, gaussianRandom(1, 0.2))
    var spellCooldowns = {}
    var totalCooldown = 0
    var elementsCount = Math.clamp(Math.round(gaussianRandom(2, 0.3)), 1, 4)
    var elements = Object.values(cooldowns).rndSubset(elementsCount)
    for (var i = 0; i < elements.length; i++) {
      var d = Math.round(4 * Math.pow(2, level * gaussianRandom(1, 0.2) + gaussianRandom(0, 0.5)))
      spellCooldowns[elements[i].id] = d
      totalCooldown += d
    }
    var result = spell(Object.assign({
      level: level,
      name: names.rnd(),
      reward: Math.max(1, Math.round(10 * rewardQuality)),
      power: quality*powered,
      decay: totalCooldown/powered,
      cooldowns: spellCooldowns,
      hotkey: params.hotkey,
      replace: function() {
        var newSpell = createSpell({
          place: this.panel,
          level: this.level,
          hotkey: this.hotkey
        })
        var index = spells.indexOf(this)
        spells[index] = newSpell
        this.destroy()
      }
    }, params))
    
    result.panel.find(".replace").click(() => result.replace())
    return result
  }
  
  return createSpell
})()