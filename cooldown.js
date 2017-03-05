cooldown = (id, name) => {
  var panel = instantiate('cooldownSample')
  $('.cooldowns').append(panel)
  setFormattedText(panel.find('.name'), name)
  panel.find('.value').addClass(id)
  var cooldown = variable(0, id, {
    formatter: x => Math.ceil(x)
  })
  cooldown.Name = name
  return cooldown
}