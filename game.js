function createGame(params) {
  
  // Rules common things
    
  var gameName = "heroes"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded " + gameName + " save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {}
    Object.values(resources).each('save')
    savedata.quests = []
    savedata.heroes = []
    savedata.items = []
    heroes.each('save')
    quests.each('save')
    items.each('save')
    savedata.selectedHeroIndex = heroes.indexOf(selectedHero)
    savedata.selectedQuestIndex = quests.indexOf(selectedQuest)
    savedata.selectedItemIndex = items.indexOf(selectedItem)
    savedata.realTime = timestamp || Date.now()
    savedata.activeTab = $('.sections>.active>a').attr('href')
    savedata.activeTechTab = $('.techs>.active>a').attr('href')
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  resources = {
    gold: variable(0, 'gold'),
    time: variable(0, 'time'),
    questLimit: variable(1, 'questLimit'),
    heroLimit: variable(1, 'heroLimit')
  }
  
  matchable = () => {
    return !!selectedHero && !!selectedQuest && !selectedHero.quest && !selectedQuest.hero
  }
  matchHeroAndQuest = function() {
    if (!matchable()) {
      return
    }
    selectedHero.quest = selectedQuest
    selectedQuest.hero = selectedHero
    selectedQuest.start()
  }
  
  heroes = []
  $('.newHero').click(() => {
    heroes.push(hero())
  })
  if (savedata.heroes) {
    heroes = savedata.heroes.map(h => hero(h))
  } else {
    heroes.push(hero())
  }
  
  quests = []
  if (savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    for (var i = 0; i < 1; i++) {
      quests.push(quest({level: 0}))
    }
  }
  
  items = []
  if (savedata.items) {
    items = savedata.items.map(item)
  } else {
    items.push(item({level: 0}))
    items.push(item({level: 1}))
  }
  
  heroes.forEach(h => h.quest = quests[h.questIndex])
  quests.forEach(q => q.hero = heroes[q.heroIndex])

  selectedHero = heroes[savedata.selectedHeroIndex]
  selectedQuest = quests[savedata.selectedQuestIndex]
  selectedItem = items[savedata.selectedItemIndex]
  
  if (!!selectedHero) {
    selectedHero.select()
  }
  if (!!selectedQuest) {
    selectedQuest.select()
  }
  if (!!selectedItem) {
    selectedItem.select()
  }
  
  buys = {
    buyQuestSlot: buy({
      id: 'buyQuestSlot',
      cost: {
        gold: () => 30 * (Math.pow(3, resources.questLimit()))
      }, 
      reward: {
        questLimit: () => 1
      }
    }),
    buyHeroSlot: buy({
      id: 'buyHeroSlot',
      cost: {
        gold: () => 30 * (Math.pow(3, resources.heroLimit()))
      }, 
      reward: {
        heroLimit: () => 1
      }
    })
  }
  
  var heroesArrivalPeriod = (hl) => heroes.length == 0 ? 0 : (heroes.length < hl ? 60 : Number.POSITIVE_INFINITY)
  
  heroesArrival = poisson({
    trigger: function() {
      heroes.push(hero())
    },
    period: () => heroesArrivalPeriod(resources.heroLimit())
  })
  
  var questChanceByLimit = (ql) => chances(Math.pow(4, ql), Math.pow(quests.length,2)*0.125*Math.pow(4, quests.length))
  questChance = () => questChanceByLimit(resources.questLimit())
  
  
  savedata.activeTab = savedata.activeTab || '#heroes'
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  $('a[href="' + savedata.activeTechTab + '"]').tab('show')
  
  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      heroes.each('paint')
      quests.each('paint')
      setFormattedText($('.heroCount'), heroes.length)
      setFormattedText($('.questCount'), quests.length)
      Object.values(buys).each('paint')
      
      setFormattedText($('.heroesArrival.period'), Format.time(heroesArrival.period()))
      setFormattedText($('.heroesArrivalPeriodUp'), Format.time(heroesArrivalPeriod(resources.heroLimit()+1)))
      setFormattedText($('.questChance'), Format.percent(questChance()))
      setFormattedText($('.questChanceUp'), Format.percent(questChanceByLimit(resources.questLimit()+1)))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.time.value += deltaTime
      heroesArrival.tick(deltaTime)
      quests.each('tick', deltaTime)
      if (quests.length < resources.questLimit()) {
        quests.push(quest({level: 0}))
      }
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}