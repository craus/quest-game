Time = {
	faster: false, 
	speed: 1, 
	shift: 0,
	tick: function(deltaTime) {
		if (this.faster) {
			this.speed *= Math.pow(2, deltaTime)
		} else {
			this.speed /= Math.pow(8, deltaTime)
			if (this.speed < 1) {
				this.speed = 1
			}
		}
		
		this.shift += (this.speed - 1) * deltaTime
	},
	gametime: function() {
		return Date.now() + this.shift * 1000
	}
}

function stop() {
  console.log("stopped")
  clearInterval(spaceTick)
  clearInterval(spacePaint)
}