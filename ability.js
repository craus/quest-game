ability = (params={}) => {
  var panel = instantiate('abilitySample')
  

  var ability = Object.assign({
    panel: panel,
    
    save: function() {
      return Object.assign({
      }, _.omit(this, 'panel'))
    },
    paint: function() {
    }
  }, params)
  
  setFormattedText(panel.find('.name'), ability.name)
  
  return ability
}