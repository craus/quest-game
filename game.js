function createGame(params) {
  
  // Rules common things
    
  var gameName = "lastBattle"
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
    savedata.units = []
    units.each('save')
    savedata.selectedUnitIndex = units.indexOf(selectedUnit)
    savedata.movingUnitIndex = units.indexOf(movingUnit)
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
  
  hero = null
  units = []
  
  if (savedata.units) {
    units = savedata.units.map(u => unit(u))
    hero = units[0]
  } else {
    hero = unit({
      name: "You",
      hp: 100, 
      maxHp: 100,
      mana: 80, 
      maxMana: 80,
      player: true,
      abilities: [
        {
          type: 'look'
        },
        {
          type: 'skipMove',
        },
        {
          type: 'hit',
          damage: R(12,20)
        },
        {
          type: 'magicArrow',
          cost: 25,
          damage: R(20,30)
        }
      ]
    })
    units.push(hero)
    units.push(unit({
      name: "Monster",
      hp: 20,
      maxHp: 35,
      abilities: [
        {
          type: 'skipMove',
        },
        {
          type: 'hit',
          damage: R(12,20)
        }
      ]
    }))
  }
  selectedUnit = units[savedata.selectedUnitIndex] || hero
  movingUnit = units[savedata.movingUnitIndex] || hero
  
  if (!!selectedUnit) {
    selectedUnit.select()
  }
  if (!!movingUnit) {
    movingUnit.startMove()
  }
    
  savedata.activeTab = savedata.activeTab || '#heroes'
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  $('a[href="' + savedata.activeTechTab + '"]').tab('show')
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      units.each('paint')
            
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return game
}