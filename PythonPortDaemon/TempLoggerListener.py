# Imports
import smtplib, email
import Adafruit_DHT
import MySQLdb
import os
import time
from picamera import PiCamera
from PIL import Image
from datetime import datetime as dt
import socket

# Config File Variables
sendingEmails = []
Threshold_Temp_Lo = -1
Threshold_Temp_Hi = -1
Threshold_Hum_Lo = -1
Threshold_Hum_Hi = -1
fullHost = ""
host = ""
alertTimer = 5
port = 12000

server = smtplib.SMTP()


dbName = ""
dbUser = ""
dbPass = ""
dpPort = 3306
piName = ""

currentTempValue = ""
image = ""
timesTextSent = 0
db = None
curs = None

configLoc = '/etc/pyFiles/portDaemonConfig.ini'
serveoConfig = '/etc/pyFiles/ServeoConfig.ini'

isTakingPicture = False
isTimerOn = False

# Get Config File
def GetConfig():
        global host
        global sendingEmails
        global Threshold_Temp_Lo
        global Threshold_Temp_Hi
        global Threshold_Hum_Hi
        global Threshold_Hum_Lo
        if os.path.isfile(configLoc) == True:
                print("Config File Found!")
                file = open(configLoc)

                index = -1
                foundItem = False
                for line in file:
                        if foundItem:
                                get_settings(index, line)
                                foundItem = False
                        else:
                                foundItem = True
                                if line.find("Host") != -1:
                                        index = 0
                                elif line.find("Nginx Port") != -1:
                                        index = 1
                                elif line.find("Emails") != -1:
                                        index = 2
                                elif line.find("Temperature Thresholds") != -1:
                                        index = 3
                                elif line.find("Humidity") != -1:
                                        index = 4
                                elif line.find("Alert") != -1:
                                        index = 5
                                else:
                                        foundItem = False
                                        
# Retrieve the settings
def get_settings(index, line):
        global host
        global sendingEmails
        global Threshold_Temp_Lo
        global Threshold_Temp_Hi
        global Threshold_Hum_Hi
        global Threshold_Hum_Lo
        if index == 0:
                fullHost = line
                hst = line[line.find('-')+1:line.find('\n')]
                host = hst.replace(".","_")
        elif index == 1:
                port = int(line)
        elif index == 2:
                for ln in line.split(';'):
                        sendingEmails.append(ln[:line.find('\n')])
        elif index == 3:
                Threshold_Temp_Lo = int(line.split(';')[0])
                Threshold_Temp_Hi = int(line.split(';')[1])
        elif index == 4:
                Threshold_Hum_Lo = int(line.split(';')[0])
                Threshold_Hum_Hi = int(line.split(';')[1])
        elif index == 5:
                alertTimer = int(line)
              

# Set up the Database
def SetUpDB():
        global db
        global curs
        db = MySQLdb.connect("localhost", "root", "", "TempData")
        curs = db.cursor()

        try:
                curs.execute("CREATE TABLE IF NOT EXISTS " + host + " (id INT(255) auto_increment, tdate DATE, ttime TIME, temperature FLOAT, humidity FLOAT, hostname VARCHAR(255), PRIMARY KEY (id))")                
                db.commit()
        except Exception as e:
                print("Error: The DB is being rolled back.")
                db.rollback()

        

# Functions
def sendAlert(temp, humidity, threshold_breached, image):
        print("Sending Alert!")
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server = host.replace('_', '.')
        s.bind((server, port))

        s.listen(1)
        c, addr = s.accept()

        message = "RPI: " + fullHost + " has experienced a threshold breach in " + threshold_breached + " where temperature is " + str(temp) + " F and humidity is " + str(humidity) + "%"
        c.send(message.encode())

        if image != None:
                c.send(image.tobytes())

        c.close()
        print("Alert Sent!")

def sendServeo():
        file = open(serveoConfig)
        message = ""

        for line in file:
                message += line

        file.close()
        
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        server = host.replace('_', '.')
        print(server)
        s.bind((server, 12000))

        s.listen(1)
        c, addr = s.accept()

        c.send(message.encode())

        c.close()
        
# Retrieve Temperature Data
# Get the temp data from the sensor and post it to the database.
def getTempData():
        global db
        global curs
        humidity, temp = Adafruit_DHT.read_retry(11, 4)
        temp = (temp * (9/5)) + 32
        try:
                curs.execute("INSERT INTO " + host + " VALUES(0, CURDATE(), CURTIME()," + str(temp) + ", " + str(humidity) + ", \"" + host + "\")")
                curs.execute("DELETE FROM " + host + " WHERE tdate < DATE_SUB(CURDATE(), INTERVAL 2 YEAR)")
                db.commit()      
        except Exception as e:
                print(e)
                db.rollback()

        return humidity, temp

def takePicture():
        print("Taking Picture")
        camera = PiCamera()

        camera.start_preview()
        time.sleep(10)
        camera.capture('/home/pi/image.jpg')
        camera.stop_preview()


# Main Program Loop
if isTakingPicture:
        camera = PiCamera()
GetConfig()
SetUpDB()
sendServeo()

while True:
        currTime = dt.now()
        startTime = dt.now()
        h, t = getTempData()      

        if isTimerOn == False:
                image = None
                BeyondThresh = False
                
                if h < Threshold_Hum_Lo or h > Threshold_Hum_Hi:
                        if isTakingPicture:
                                image = takePicture()
                        sendAlert(t, h, "Humidity", image)
                        BeyondThresh = True
                if t < Threshold_Temp_Lo or t > Threshold_Temp_Hi:
                        if isTakingPicture:
                                image = takePicture()
                        sendAlert(t, h, "Temperature", image)
                        BeyondThresh = True

                isTimerOn = True 
                startTime = dt.now()
        else:
                minutes = (dt.now() - startTime).total_seconds() / 60.0

                if minutes >= alertTimer:
                        isTimerOn = False

        time.sleep(60)
