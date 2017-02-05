console.log('Loading...')
var gpio = require('gpio'),
	snd = require('node-aplay'),
	fs = require('fs'),
	shuffle = require('shuffle-array'),
	request = require("request"),
	options = require('./config.json'),
	ledOn = true,
	flashTmr = 0,
	soundsDir = './sounds/' + options.soundsDir + '/',
	wavs = [],
	dd,
	playing = false
fs.readdir(soundsDir, function(err, files) {
	files.forEach(function(file) {
		wavs.push(file)
	})
	var led = gpio.export(4, {
		direction: 'out',
		ready: function() {
			led.set()
			var btn = gpio.export(18, {
				direction: 'in',
				ready: function() {
					var pb = function(msg) {
						process.nextTick(function() {
							request({
								method: 'POST',
								url: 'https://api.pushbullet.com/v2/pushes',
								headers: {
									'content-type': 'application/json',
									'access-token': options.PBToken
								},
								body: {
									body: msg,
									title: 'Home Alert',
									type: 'note'
								},
								json: true
							})
						})
					}
					console.log('Ready')
					reDd()
					btn.on('change', function(val) {
						if (val + flashTmr == 0 && !playing) {
							dd.play()
							playing = true
							flashTmr = options.flashDur
							flash()
							pb('Doorbell Activated')
						}
					})

					function reDd() {
						playing = false
						shuffle(wavs)
						dd = new snd(soundsDir + wavs[0])
						dd.on('complete', function() {
							reDd()
						})
					}

					function flash() {
						flashTmr--
						if (flashTmr > 0 || playing) {
							ledOn = !ledOn
							setTimeout(flash, 1000)
						} else {
							flashTmr = 0
							ledOn = true
						}
						led.set(+ledOn)
					}
				}
			})
		}
	})
})
