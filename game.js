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
		savedata.timeShift = Time.shift
    localStorage[saveName] = JSON.stringify(savedata)
  } 
	
	Time.shift = savedata.timeShift || 0
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  resources = {
    gold: variable(0, 'gold'),
    time: variable(0, 'time', {formatter: x => moment.duration(x,'s').format()}),
    questLimit: variable(1, 'questLimit'),
    heroLimit: variable(1, 'heroLimit'),
    traderLimit: variable(0, 'traderLimit')
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
  }
  
  heroes.forEach(h => h.quest = quests[h.questIndex])
  quests.forEach(q => q.hero = heroes[q.heroIndex])
  heroes.forEach(h => h.items = [])
  items.forEach(i => {
    i.hero = heroes[i.heroIndex]
    if (!!i.hero) {
      i.hero.items.push(i)
    }
  })
	heroes.forEach(h => h.updateItemsList())

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
        gold: () => 25 * (Math.pow(4, resources.questLimit()-1))
      }, 
      reward: {
        questLimit: () => 1
      }
    }),
    buyHeroSlot: buy({
      id: 'buyHeroSlot',
      cost: {
        gold: () => 25 * (Math.pow(4, resources.heroLimit()-1))
      }, 
      reward: {
        heroLimit: () => 1
      }
    }),
    buyTraderSlot: buyEvent({
      id: 'buyTraderSlot',
      cost: {
        gold: () => 100 * (Math.pow(4, resources.traderLimit()))
      }, 
      reward: () => {
        items.push(item({level: 1}))
        resources.traderLimit.value += 1
      }
    })
  }
  
	baseHeroesArrivalPeriod = 30
  var heroesArrivalPeriod = (hl) => heroes.length == 0 ? 0 : (heroes.length < hl ? baseHeroesArrivalPeriod : Number.POSITIVE_INFINITY)
  
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

	console.log("radio")
	$("input:radio[name=itemSort]").change(function(){
		console.log("radio") 
	});     
  
	
	heroSpawning = false
	
  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      heroes.each('paint')
      quests.each('paint')
      items.each('paint')
      setFormattedText($('.heroCount'), heroes.length)
      setFormattedText($('.questCount'), quests.length)
      Object.values(buys).each('paint')
			
			heroSpawning = heroesArrival.period() < Number.POSITIVE_INFINITY
      $('.heroSpawning').toggle(heroSpawning)
      $('.noHeroSpawning').toggle(!heroSpawning)
			
			$('.outsideTab').toggle(items.some(item => item.section() == 'outside'))
			$('.keepTab').toggle(items.some(item => item.section() == 'keep'))
      
      setFormattedText($('.heroesArrival.period'), moment.duration(heroesArrival.period(), 's').format("s [seconds]"))
      setFormattedText($('.heroesArrivalPeriodUp'), Format.time(heroesArrivalPeriod(resources.heroLimit()+1)))
      setFormattedText($('.heroLimit'), resources.heroLimit())
      setFormattedText($('.questChance'), Format.percent(questChance()))
      setFormattedText($('.questChanceUp'), Format.percent(questChanceByLimit(resources.questLimit()+1)))
			
			$('.timeSpeeded').toggle(Time.speed > 1) 
			setFormattedText($('.timeSpeed'), large(Time.speed))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000

			Time.tick(deltaTime)
			deltaTime *= Time.speed
			
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