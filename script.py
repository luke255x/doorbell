import glob, random, subprocess, urllib, urllib2, RPi.GPIO as GPIO, time, threading
from time import gmtime, strftime
def tmstmp():
    return strftime("%Y-%m-%d %H-%M-%S", gmtime())
def log(str):
    with open("/home/pi/doorbell/debug.log", "a") as myfile:
        myfile.write(tmstmp() + ' ' + str + '\n')
def pb(msg):
    try:
        log(msg)
        urllib2.urlopen(urllib2.Request('https://api.pushbullet.com/v2/pushes', urllib.urlencode({'type' : 'note', 'title': 'Home Alert', 'body': msg}), { 'Access-Token' : '3pD1Y23Qu2jtnUuYi0DiIVTHsCX30c06' })).read()
    except urllib2.URLError:
        pass
def flash():
    for i in range(2,12):
        if i % 2 == 0:
            GPIO.output(7,False)
        else:
            GPIO.output(7,True)  
        time.sleep(0.5)
def wc():
    subprocess.Popen(['fswebcam', '-r 960x720','/home/pi/doorbell/snaps/' + tmstmp() + '.jpg'])
GPIO.setmode(GPIO.BOARD)
GPIO.setup(7, GPIO.OUT)
GPIO.setup(12, GPIO.IN)
GPIO.output(7,True)
log('Script Initialised')
thr = threading.Thread(target=flash)
try:
    while True:
        log('Primed')
        snd = random.choice(glob.glob("/home/pi/doorbell/sounds/*.wav"))
        GPIO.wait_for_edge(12, GPIO.FALLING)
        log('Signal detected, waiting...')
        time.sleep(0.08)
        if GPIO.input(12) != GPIO.HIGH:
            thr.start()
            subprocess.Popen(['aplay', snd])
            pb('Doorbell Alert!')
            thr.join()
            thr = threading.Thread(target=flash)
        else:
            log('Singal ignored')
except:  
    GPIO.cleanup()
    log('SCRIPT TERMINATED')
GPIO.cleanup()
