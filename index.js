var gpio = require('gpio')
var snd = require('node-aplay');
var ledOn = true
var led = gpio.export(4, {
	direction: "out",
	ready: function() {
		led.set()
		var btn = gpio.export(18, {
			direction: "in",
			ready: function() {
				var dd = new snd('./sounds/dingdong.wav')
				btn.on("change", function(val) {
					if (val == 0) {
						dd.play();
					}
				});
			}
		})

		function flash(secs) {
			return
			ledOn = !ledOn
			led.set(+ledOn)
		}
	}
})
