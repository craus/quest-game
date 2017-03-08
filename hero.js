hero = (params={}) => {
  var panel = instantiate('heroSample')
  $('.heroes').append(panel)
  var tab = instantiate('heroTabSample')
  $('.heroTabs').append(tab)

  var name = names.rnd()
  for (var i = 0; i < 100; i++) {
    if (heroes.every(x => x.name != name)) {
      break
    }
    name = names.rnd()
  }
  
  var hero = Object.assign({
    name: name,
    items: [],
    skills: {
      defense: 1,
      speed: 1,
      wealth: 1,
      intelligence: 1
    },
    effectiveSkill: function(skill) {
      return this.items.reduce((acc, item) => acc * (item.effects[skill] || 1), this.skills[skill])
    },
    skillGrowth: {
      defense: () => hero.skills.defense*1.5,
      speed: () => hero.skills.speed*2,
      wealth: () => hero.skills.wealth*2,
      intelligence: () => hero.skills.intelligence * (2 + 0.2/hero.skills.intelligence)
    },
    level: 0,
    skillPoints: 0,
    experience: 0,
    alive: true,
    deselect: function() {
      selectedHero = null
      tab.removeClass('active')
      panel.removeClass('active')
      panel.removeClass('in')
    },
    select: function() {
      if (!!selectedHero) {
        selectedHero.deselect()
      }
      selectedHero = this
      if (!!this.quest && selectedQuest != this.quest) {
        this.quest.select()
      }
      if (!this.quest && !!selectedQuest && !!selectedQuest.hero) {
        selectedQuest.deselect()
      }
      tab.addClass('active')
      panel.addClass('active')
      panel.addClass('in')
    },
    abandon: function() {
      this.quest.abandon()
    },
    status: function() {
      if (this.quest) {
        if (this.quest.completed()) {
          return "Completed \u2014 " + this.quest.name
        }
        if (!this.alive) {
          return "Dead \u2014 " + this.quest.name
        }
        return "On a quest \u2014 #{0} (#{1})".i(this.quest.name, Format.percent(this.quest.progress()))
      }
      if (this.selected) {
        return "Waiting for a quest"
      }
      return "Idle"
    },
    experienceToLevelUp: function() {
      return 10*Math.pow(2, this.level)
    },
    learn: function(exp) {
      this.experience += exp
      while (this.experience >= this.experienceToLevelUp()) {
        this.experience -= this.experienceToLevelUp()
        this.level += 1
        this.skillPoints += 1
      }
    },
    skillUp: function(skill) {
      if (this.skillPoints < 1) {
        return
      }
      this.skillPoints -= 1
      this.skills[skill] = this.skillGrowth[skill]()
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      setFormattedText(tab.find('.status'), this.status())
      setFormattedText(panel.find('.level'), this.level)
      setFormattedText(tab.find('.level'), this.level)
      setFormattedText(panel.find('.skillPoints'), this.skillPoints)
      panel.find('.skillPointsNotZero').toggle(this.skillPoints > 0)
      
      panel.find('.skillUp').toggle(this.skillPoints > 0)
      var a = tab.find('a')
      a.toggleClass('completed', !!this.quest && this.quest.completed())
      a.toggleClass('inProgress', !!this.quest && this.quest.inProgress())
      a.toggleClass('failed', !!this.quest && this.quest.failed())
      setFormattedText(panel.find('.speed').find('.skillUpValue'), large(this.skillGrowth.speed()))
      setFormattedText(panel.find('.defense').find('.skillUpValue'), large(this.skillGrowth.defense()))
      setFormattedText(panel.find('.wealth').find('.skillUpValue'), large(this.skillGrowth.wealth()))
      setFormattedText(panel.find('.intelligence').find('.skillUpValue'), large(this.skillGrowth.intelligence()))
      
      setFormattedText(panel.find('.speed').find('.value'), large(this.skills.speed))
      setFormattedText(panel.find('.defense').find('.value'), large(this.skills.defense))
      setFormattedText(panel.find('.intelligence').find('.value'), large(this.skills.intelligence))
      setFormattedText(panel.find('.wealth').find('.value'), large(this.skills.wealth))
      
      setFormattedText(panel.find('.speed').find('.effectiveValue'), large(this.effectiveSkill('speed')))
      setFormattedText(panel.find('.defense').find('.effectiveValue'), large(this.effectiveSkill('defense')))
      setFormattedText(panel.find('.intelligence').find('.effectiveValue'), large(this.effectiveSkill('intelligence')))
      setFormattedText(panel.find('.wealth').find('.effectiveValue'), large(this.effectiveSkill('wealth')))
      
      setFormattedText(panel.find('.experience'), large(this.experience))
      setFormattedText(panel.find('.experienceToLevelUp'), large(this.experienceToLevelUp()))
      
      setFormattedText(panel.find('.itemCount'), this.items.length)
      
      panel.find('.equipped').toggle(this.items.length > 0)
      
      enable(panel.find('.start'), matchable())
      panel.find('.start').toggle(!this.quest)
      panel.find('.abandon').toggle(!!this.quest && this.quest.inProgress())
      panel.find('.bury').toggle(!!this.quest && this.quest.failed())
      panel.find('.claimReward').toggle(!!this.quest && this.quest.completed())
    },
    save: function() {
      savedata.heroes.push(Object.assign({
        questIndex: quests.indexOf(this.quest)
      }, _.omit(this, 'quest', 'questIndex', 'items', 'skillGrowth')))
    },
    destroy: function() {
      panel.remove()
      tab.remove()
      heroes.splice(heroes.indexOf(this), 1)
      if (this.quest) {
        this.quest.hero = null
      }
      this.items.forEach(i => i.destroy())
      if (selectedHero == this) {
        selectedHero = null
      }
    }
  }, params)
  
  setFormattedText(panel.find('.name'), hero.name)
  setFormattedText(tab.find('.name'), hero.name)
  panel.find('.start').click(matchHeroAndQuest)
  panel.find('.abandon').click(() => hero.abandon())
  panel.find('.bury').click(() => hero.destroy())
  panel.find('.speed').find('.skillUp').click(() => hero.skillUp('speed'))
  panel.find('.defense').find('.skillUp').click(() => hero.skillUp('defense'))
  panel.find('.wealth').find('.skillUp').click(() => hero.skillUp('wealth'))
  panel.find('.intelligence').find('.skillUp').click(() => hero.skillUp('intelligence'))
  panel.find('.claimReward').click(() => hero.quest.claimReward())
  
  tab.find('a').click(() => hero.select())
  return hero
}