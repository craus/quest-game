variable = function(initialValue, id, params) {
  if (params == undefined) {
    params = {}
  }
  var income = params.income || (() => 0)
  if (savedata[id] != undefined) {
    initialValue = savedata[id]
  }
  var formatter = params.formatter || (function(x) { return large(Math.floor(x+eps)) })
  var incomeFormatter = params.incomeFormatter || (function(x) { return noZero(signed(large(Math.floor(x+eps)))) })

  var result = () => {
    return result.value
  }
  return Object.assign(result, {
    value: initialValue, 
    id: id,
    income: income,
    backup: function() {
      this.backupValue = this.value
    },
    restore: function() {
      this.value = this.backupValue
    },
    paint: function() {
      var variable = this
      setFormattedText($('.#{0}.value, .#{0} .value'.i(id)), formatter(variable()))
      setFormattedText($('.#{0}.income, .#{0} .income'.i(id)), incomeFormatter(this.income()))
    },
    tick: function(deltaTime) {
      this.value += this.income() * deltaTime
    },
    save: function() {
      savedata[id] = this.value
    }
  })
}  