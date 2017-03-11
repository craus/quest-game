
Array.prototype.last = function() {
  return this[this.length-1]
}

Array.prototype.remove = function(element) {
  var i = this.indexOf(element);
  if(i != -1) {
    this.splice(i, 1);
  }
}

Array.prototype.each = function(method) {
  var args = Array.prototype.slice.call(arguments,1)
  for (var i = 0; i < this.length; i++) {
    this[i][method].apply(this[i],args)
  }
}

Array.prototype.rnd = function() {
  return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.rndSubset = function(cnt) {
  var result = []
  for (var i = 0; i < this.length; i++) {
    if (rndEvent((cnt - result.length) / (this.length - i))) {
      result.push(this[i])
    }
  }
  return result
}

Array.prototype.cyclicGet = function(index) {
  return this[index%this.length]
}

Array.prototype.cyclicNext = function(el, delta=1) {
  return this.cyclicGet(this.indexOf(el)+delta)
}

Array.prototype.find = function(criteria) {
  for (var i = 0; i < this.length; i++) {
    if (criteria(this[i])) {
      return this[i]
    }
  }
  return null
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.i = function() {
  var args = Array.prototype.slice.call(arguments,0)
  return Object.entries(args).reduce((s, entry) => s.replaceAll('#{'+entry[0]+'}', entry[1]), this.toString())
}

Math.sign = function(x) {
  if (x > 0) {
    return 1
  } else if (x < 0) {
    return -1
  } else {
    return 0
  }
}

Math.lg = function(x, y) {
  return Math.log(x) / Math.log(y)
}

Math.clamp = function(x, min, max) {
  return Math.min(Math.max(x, min), max);
};