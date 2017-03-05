function command(params)
{
  var buttonGroup = $('.'+params.id)
  var less = buttonGroup.find('.less')
  var more = buttonGroup.find('.more')
  var buy = buttonGroup.find('.buy')
  var cost = $('.'+params.id+"Cost")
  var deltaLabel = $('.'+params.id+"Delta")
  
  var result = $.extend({
    zoom: 1,
    onZoomChanged: function(){},
    alwaysTop: false,
    check: function(cnt){return false},
    run: function(cnt){},
    use: function() {
      this.run(this.zoom)
    },
    canUse: function() {
      return this.check(this.zoom)
    },
    canZoomUp: function() {
      return this.check(this.zoom+1)
    },
    canZoomDown: function() {
      return this.zoom > 1
    },
    zoomUp: function() {
      if (this.canZoomUp()) {
        this.zoom += 1
        this.onZoomChanged()
      }
    },
    zoomDown: function() {
      if (this.canZoomDown()) {
        this.zoom -= 1
        this.onZoomChanged()
      }
    },
    adjust: function() {
      this.onZoomChanged()
      while (this.canZoomDown() && !this.canUse()) {
        this.zoom -= 1
      }
      if (this.alwaysTop) {
        while (this.canZoomUp()) {
          this.zoom += 1
        }
      }
    },
    switchAlwaysTop: function() {
      this.alwaysTop = !this.alwaysTop
    },
    paint: function() {
      enable(less, this.canZoomDown())
      enable(more, this.canZoomUp())
      enable(buy, this.canUse())
    }
  }, params)
  
  buy.click(function() { result.use() })
  more.click(function() { result.zoomUp() })
  less.click(function() { result.zoomDown() })
  
  return result
}