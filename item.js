item = (params={}) => {
  var panel = instantiate('itemSample')
  var tab = instantiate('itemTabSample')
  if (params.instantiate != false) {
    $('.traders').append(panel)
    $('.traderTabs').append(tab)
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
      panel.find('.start').toggle(this.idle())
      panel.find('.abandon').toggle(this.inProgress())
      panel.find('.buryHero').toggle(this.failed())
      panel.find('.claimReward').toggle(this.completed())
      panel.find('.discard').toggle(this.idle() && this.level > 0)
    },
    tick: function() {
      if (!this.hero) {
        return
      }
      var currentTime = Math.min(this.effectiveDuration(), this.spentDuration())
      var t = currentTime - this.lastSavePoint
      var sample = PoissonProcess.sample(this.lifeTime())
      if (sample < t) {
        console.log("dead")
        this.hero.alive = false
      } else {
        this.lastSavePoint = currentTime
      }
    },
    save: function() {
      savedata.items.push(this)
    },
    claimReward: function() {
      resources.gold.value += this.effectiveGold()
      this.hero.learn(this.effectiveExperience())
      this.abandon()
      this.destroy()
      quests.push(quest({level: this.level}))
      if (rndEvent(questChance())) {
        quests.push(quest({level: this.level+1}))
      }
    },
    destroy: function() {
      panel.remove()
      tab.remove()
      quests.splice(quests.indexOf(this), 1)
      if (!!this.hero) {
        this.hero.quest = null
      }
      if (selectedQuest == this) {
        selectedQuest = null
      }
    }
  }, params)
  
  panel.find('.start').click(matchHeroAndQuest)
  panel.find('.abandon').click(() => result.abandon())
  panel.find('.claimReward').click(() => result.claimReward())
  panel.find('.buryHero').click(() => result.hero.destroy())
  panel.find('.discard').click(() => result.destroy())
  
  tab.find('a').click(() => result.select())
  return result
}