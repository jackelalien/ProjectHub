
# Python Port Listening

# This dameon listens on a specified port and looks for other nodes. 
# On start, give user five seconds to type y or n before continuing. This allows to change the defaulted settings

# DEBUG VAR - KEEP FALSE WHEN TESTING ON PI
# 10/30/2018 - Will not work due to config changes. Keep False and test on Pi
isWindows = False

# Imports
import keyboard
import time
import os
import socket
import string, random
import subprocess
import signal
import threading
from _thread import *
from threading import Thread
import ipaddress
from nginxparser import load, dumps
import nginxparser as np

# For Pi Use Only, import the following
import sys
import tty
import termios

## File Vars
file = None
isChangingSettings = False

## Config Vars
port = 21999
host = ''
timeoutTime = 15
timeoutTimeTCP = 5
ElectionTimer = 10
maxConnRequests = 100
maxConnTries = 3


## Temp Logger / Web Vars
tempProgramLoc = ""
emailList = ""
phoneList = ""

### In the future, doing cryptography

## Main Vars
isInSession = False
isMaster = False
masterAddress = None
currentConnections = 0
ping = 99999
isVoting = False
HasVoted = False
HasPinged = False
votesForMe = 0
tcpConnection = None
broadcast = None
usingLoad = False
HasLoad = False
rpsChoice = 0

# Set up our RPi name list to determine
piList = []
#piList.append(host)

piPingList = {}
smallestPing = 99999.0

piLoadList = {}
smallestLoad = 99999.0

votedPiList = []
voteList = {}

# Nginx Settings
updatedNginx = False
listeningPort = 22000
nginxDir = ''

# MariaDB Settings
galeraDir = ''

# Def Methods
def set_port(line):
        global port
        port = int(line)

def set_host(line):
        global host
        host = line

def set_UDP_Timeout(string):
        global timeoutTime
        timeoutTime = int(string)

def set_TCP_Timeout(string):
        global timeoutTimeTCP 
        timeoutTimeTCP = int(string)

def set_Nginx_Directory(line):
        global nginxDir
        nginxDir = line

def set_Nginx_Listening_Port(line):
        global listeningPort
        listeningPort = int(line)

def set_Galera_Dir(line):
        global galeraDir
        galeraDir = line[:line.find('\n')]

def get_settings(value, line):
        if value == 0:
                set_port(line)
        elif value == 1:
                set_host(line)
        elif value == 2:
                set_UDP_Timeout(line)
        elif value == 3:
                set_TCP_Timeout(line)
        elif value == 4:
                set_Nginx_Directory(line)
        elif value == 5:
                set_Nginx_Listening_Port(line)
        elif value == 6:
                set_Galera_Dir(line)

# Ping function that returns the average ping value.
def Ping(hstIP):
        testHost = hstIP
        print("Finding Lowest Ping to serve as master...")
        proc = subprocess.run(["ping", "-c", "5", testHost], stdout=subprocess.PIPE)
        result = str(proc.stdout)
        print(result)
        startPoint = result.find("time ")
        if startPoint != -1:
                endPoint = result.find("ms", startPoint)
                if endPoint != -1:
                         a = result[startPoint:endPoint]
                         b = a.split()
                         c = b[len(b)-1]
                         c = c.split('ms')
                         return float(c[0])
        return -1

## TCP Connection Functions ##
def OpenTCPConnection():
        tcpSock.bind(tcpConnection)
        tcpSock.listen(maxConnRequests) 

def ConnectToServerTCP():
        tries = 1
        while tries <= maxConnTries:
                try:
                        tcpSock.connect((masterAddress, port))
                        return True
                except socket.error as e:
                        print("Couldn't connect to server - Trying again - Connection Effort " + str(tries) + " of " + str(maxConnTries))
                        print("Failure Reason: " + str(e))
                        tries = tries + 1

        print("Connection failure")
        return False

def CheckTCPConnection(hst):
        tries = 1
        try:
                tcpSock.send(bytes('test', 'UTF-8'))
        except socket.error as e:
                connected = False
                print("ERROR: " + str(e))
                print("Connection to Master lost, attempting reconnect...")

                while tries <= maxConnTries or not connected:
                        try:
                                tcpSock.connect((hst, port))
                                connected = True
                                print("Reconnected!")
                        except socket.error:
                                time.sleep(2)

                if tries >= maxConnTries:
                        print("Failed to reconnect. Master is probably down?")
                        return False
        return True

def ThreadedTCPListener():
        try:
                cli, addr = tcpSock.accept()
                with cli:
                        print("Connected by ", addr)
                        while True:
                                data = cli.recv(1024)
                                if not data:
                                        break
                                cli.sendall(data)

        except socket.timeout as e:
                print("No connection yet...")
        except socket.error as e:
                print("Socket error: " + str(e))

## Keyboard Capture for the Pi ##
def getKey():
        isWindows = False
        if isWindows == False:
                fd = sys.stdin.fileno()
                old = termios.tcgetattr(fd)
                new = termios.tcgetattr(fd)
                new[3] = new[3] & ~termios.ICANON & ~termios.ECHO
                new[6][termios.VMIN] = 1
                new[6][termios.VTIME] = 0
                termios.tcsetattr(fd, termios.TCSANOW, new)
                key = None
                
                try:
                        key = os.read(fd, 3)
                finally:
                        termios.tcsetattr(fd, termios.TCSAFLUSH, old)
                return key
        return None

## Custom Timeout ##
class Timeout():
        class Timeout(Exception):
                pass

        def __init__(self, sec):
                self.sec = sec

        def __enter__(self):
                signal.signal(signal.SIGALRM, self.raise_timeout)
                signal.alarm(self.sec)

        def __exit__(self, *args):
                signal.alarm(0)

        def raise_timeout(self, *args):
                raise Timeout.Timeout()

## Nginx Functions ##
def ChangeNginxConfig():
        file = load(open(nginxDir.strip('\n')))
        if(isMaster):
                print("Changing config - host")
                hst = host.split('-')[1]
                
        else:
                print("Changing config - client")
                hst = masterAddress
        
        # Actually Change Config after determining master address
        listenIndex = -1 
        serverNameIndex = -1 
        defaultserverListenIndex = -1 
        redirectIndex = -1
        rootIndex = -1 # May not need to change. It's just a redirect we add.
        httpIndex = -1 
        serverIndex = -1 

        overIndex = 0
        for key_a, value_a in file:
                if isWindows == False:
                        # Just looking for "server", not http
                        overIndex = 0
                        if str(key_a).find('server') != -1:
                                serverIndex = overIndex

                                overIndex = 0
                                for key_b in file[serverIndex][1]:
                                        if str(key_b).find('listen') != -1 and str(key_b).find('[::]') == -1:
                                                listenIndex = overIndex
                                        elif str(key_b).find('[::]') != -1:
                                                defaultserverListenIndex = overIndex
                                        elif str(key_b).find('server_name') != -1:
                                                serverNameIndex = overIndex
                                        elif str(key_b).find('return') != -1:
                                                redirectIndex = overIndex

                                        overIndex = overIndex + 1
                                overIndex = overIndex + 1
                overIndex = overIndex + 1

        if isWindows == False:
                # No HTTP Index
                file[serverIndex][1][listenIndex][1] = str(listeningPort)
                file[serverIndex][1][defaultserverListenIndex][1] = "[::]:" + str(listeningPort) + " default_server"
                file[serverIndex][1][serverNameIndex][1] = str(masterAddress)
                file[serverIndex][1][redirectIndex][1] = "301 http://" + str(masterAddress) + ":" + str(listeningPort)

        print(str(file))
        writeFile = open(nginxDir.strip('\n'), 'w')
        np.dump(file, writeFile)
        writeFile.close()

        ## Force Nginx to Restart
        subprocess.run(["sudo", "service", "nginx", "reload"], stdout=subprocess.PIPE)
		
		## NEW IMPLEMENTATION: RUN NODEJS
		subprocess.Popen(["nohup","sudo","node","app.js","&"])


## Galera DB Functions ##
def ChangeDBConfig():
        print("Updating DB Configuration...")
        file = open(galeraDir)

        for line in file:
                if line.find("wsrep_cluster_address") != -1:
                        insertLine = "\"gcomm://" + masterAddress
                        
                        for hst in piList:
                                if hst.split("-")[1] != masterAddress:
                                        insertLine = insertLine + "," + hst.split("-")[1]
                        line.split()[2] = insertLine + "\""


                elif line.find("wsrep_node_address") != -1:
                        line.split()[2] = "\"" + host.split('-')[1] + "\""
                elif line.find("wsrep_node_name") != -1:
                        line.split()[2] = "\"" + host.split('-')[0] + "\""

        file.close()

        subprocess.run(["sudo", "systemctl", "stop", "mysql"], stdout=subprocess.PIPE)

        if isMaster == True:
                subprocess.run(["sudo", "galera_new_cluster"], stdout=subprocess.PIPE)
                print("Starting Cluster...")
        else:
                subprocess.run(["sudo", "systemctl", "start", "mysql"], stdout=subprocess.PIPE)

## Secondary Program ##
def runLogger():
        subprocess.run(["pkill", "-9", tempProgramLoc], stdout=subprocess.PIPE)   
        subprocess.run(["sudo", "nohup", "python3", tempProgramLoc, "&"])

## Serveo Program ##
def runServeo():
        resp = subprocess.getoutput("ps")

        r = resp.split('\n')
        r2 = []
        for line in r:
                if line.find("ssh") != -1:
                        r2 = line.split()

        if r2 != []:
                subprocess.run(['kill', r2[0]], stdout=subprocess.PIPE)
        
        subprocess.Popen(["nohup","ssh","-R","80:" + str(masterAddress) + ":" + str(listeningPort), "serveo.net", "&"])

        print("Made it here")

        sp_nohup = open('nohup.out')
        sp_line = []
        for line in sp_nohup:
                if line.find("Forwarding HTTP") != -1:
                        sp_line = line.split()
                        break
        
        f = open('/etc/pyFiles/ServeoConfig.ini', 'w')
        f.write(sp_line[4])
        f.close()
        

ipConfigString = "ifconfig"
split_First = 1
split_Second = 17
split_char = " "
splitloc_First = 1
splitloc_Second = 1

# Get the IP Config Settings
def GetIPConfigSettings():
    global ipConfigString
    global split_First
    global split_Second
    global splitloc_First
    global splitloc_Second
    isWindows = False;
    ipConfigString = "ifconfig"
    if not isWindows:
        
        split_First = 1
        split_Second = 17
        split_char = " "
        splitloc_First = 1
        splitloc_Second = 1

# Auto Rename the Pi should a different address get assigned
def auto_rename():
        # Get front of name
        hst = host.split('-')[0]
        hst = hst + '-'
        # get ip (wifi)
        rAlpha = subprocess.getoutput(ipConfigString).split("\n")[split_First].split()[splitloc_First][0:]
        rTest = str(rAlpha)

        # ethernet found
        if rTest.find(":") != -1:
                rAlpha = subprocess.getoutput(ipConfigString).split("\n")[split_Second].split()[splitloc_Second][0:]

        host = hst + rAlpha

        file = open('/etc/pyFiles/portDaemonConfig.ini', 'r+')
        editNext = False
        index = -1

        for line in file:
                index += 1
                if line.find("Unique Host") != -1:
                        line = host
                        break

                                
                        
                        
        
        

#### Main Program Loop ####
# First detect that a configuration file exists
print("Booting PyPortDaemon...")
print("Loading config file...")
GetIPConfigSettings()

# Start up, allow changing config file
if os.path.isfile('/etc/pyFiles/portDaemonConfig.ini') == True:
        # Config File Found, allow for changes.

        # On Start, give user five seconds to type y or n before continuing. If time elapses, assume answer 'n'
        print("To change settings, type y before complete boot")
        print("Change Settings? y/n")

        start = time.time()
        end = time.time()

        isChangingSettings = False
        isWindows = False

        while (end - start) < 5:
                if isWindows == False:
                        try:
                                with Timeout(5):
                                        print("RPI")
                                        x = str(getKey())
                                        print(x)
                                        if x == "b'y'":
                                                print("Opening Config File...")
                                                isChangingSettings = True
                                                break
                                        elif x == "b'n'":
                                                print("Continuing Boot...")
                                                isChangingSettings = False
                                                break
                        except Timeout.Timeout:
                                break

                end = time.time()
   
else:
        # No config file, must make them.
        isChangingSettings = True;
        auto_rename()



#Is Changing Settings? Open the File, Clear it, redo it.
if isChangingSettings == True:
        file = open('/etc/pyFiles/portDaemonConfig.ini', 'w')
        file.truncate(0)

        file.write("## ONLY USE THE PORT LISTENING APPLICATION TO EDIT THIS FILE - ANY MISTAKES MAY CRASH THE PROGRAM ##")
        file.write("\n")
        
        # Change the port
        while True:
                portNum = input("Port to listen for other Raspberry Pi Loggers: ")
                try:
                        port = int(portNum)

                        file.write("## Port Number ##\n")
                        file.write(portNum)

                        break
                except ValueError:
                        print("Invalid Argument, please enter an integer port number.")
                        pass

        file.write('\n')
        
        # Change the RPi name
        while True:
                hostName = input("Name for RPi (to broadcast to other Pis - will generate a random string behind it): ")
                try:
                        host = hostName
                        h1 = host.strip('-')
                        print("Your new host name is:")
                        host = h1
                        host = host + '-'
                        rAlpha = subprocess.getoutput(ipConfigString).split("\n")[split_First].split()[splitloc_First][0:]
                        rTest = str(rAlpha)
                        print(rTest)


                        if rTest.find(":") != -1:
                                rAlpha = subprocess.getoutput(ipConfigString).split("\n")[split_Second].split()[splitloc_Second][0:]

                        host = host + rAlpha
                        print(host)


                        file.write("## Unique Host Name ##\n")
                        file.write(host)

                        break
                except TypeError:
                        print("Invalid Argument, please enter a unique host name.")
                        pass

        file.write('\n')

        # Change UDP Timeout Time
        while True:
                timeoutUDPNum = input("Timeout in seconds for listening (Recommended 15): ")
                try:
                        timeoutTime = int(timeoutUDPNum)

                        file.write("## Timeout Time - How long to find other nodes before declaring master ##\n")
                        file.write(timeoutUDPNum)

                        break
                except ValueError:
                        print("Invalid Argument, please enter an integer number.")
                        pass

        file.write('\n')

        # Change TCP Timeout Time
        while True:
                timeoutTCPNum = input("Timeout in seconds for Master Listening (Recommended 5): ")
                try:
                        timeoutTimeTCP = int(timeoutTCPNum)

                        file.write("## TCP Master Listener Timeout - how many seconds before Master times out and rebroadcasts ##\n")
                        file.write(timeoutTCPNum)

                        break
                except ValueError:
                        print("Invalid Argument, please enter an integer number.")
                        pass

        file.write('\n')

        # Change Nginx Directory
        while True:
                nginxDir1 = input("Nginx Sites-enabled config file location (default: /etc/nginx/sites-enabled/default): ")
                try:
                        nginxDir = nginxDir1.split('\n')[0]
                        print(nginxDir)

                        file.write("## Nginx Config Directory ##\n")
                        file.write(nginxDir)
                        break
                except ValueError:
                        print("Invalid Argument - enter directory for Nginx Config File.")
                        pass
        file.write('\n')

        # Change Nginx Listening Port
        while True:
                listeningPort = input("Port for nginx to serve (example: 80): ")
                try:
                        listeningPort = int(listeningPort)

                        file.write("## Nginx Port Number ##\n")
                        file.write(portNum)

                        break
                except ValueError:
                        print("Invalid Argument, please enter an integer port number.")
                        pass

        file.write('\n')

        # Change Galera Directory
        while True:
                galera = input("Directory for Galera Cnf File (default: /etc/mysql/conf.d/galera.cnf): ")

                try:
                        galeraDir = galera.split('\n')[0]
                        print(galeraDir)

                        file.write("## Galera Configuration Directory ##\n")
                        file.write(galeraDir)

                        break
                except ValueError:
                        print("Invalid Argument - enter directory for Galera Config File.")
                        pass

        file.write('\n')

        # Get Second Program Location
        while True:
                secondProg = input("Enter location for Temp Logger Program (Default: /home/PythonProgs/TempLoggerListener.py): ")

                try:
                        tempProgramLoc = secondProg.split('\n')[0]

                        file.write("## Temperature Logger Program Location ##\n")
                        file.write(tempProgramLoc)

                        break
                except ValueError:
                        print("Invalid Argument - enter temp logger program location")
                        pass

        file.write('\n')

        # Get Email List
        while True:
                emails = input("Enter emails to send alerts to (use ; in between, no spaces): ")

                try:
                        emailList = emails.split('\n')[0]

                        file.write("## Temperature Logger Emails ##\n")
                        file.write(emailList)

                        break
                except ValueError:
                        print("Invalid Argument - enter temp logger emails")
                        pass


        file.write('\n')

        # Get Thresholds Temperature
        while True:
                threshs = input("Enter temperature Low/High Thresholds (as Low;High, integers, no spaces): ")

                try:
                        f = threshs.split('\n')[0]
                        nums = f.split(';')

                        if f.find(';') == -1 or not nums[0].isdigit() or not nums[1].isdigit():
                                raise ValueError;
                        
                        file.write("## Temperature Thresholds ##\n")
                        file.write(f)

                        break
                except ValueError:
                        print("Invalid Argument - Enter Temperature thresholds as Low;High")
                        pass


        file.write('\n')

        # Get Thresholds Humidity
        while True:
                threshs = input("Enter humidity Low/High Thresholds (as Low;High, integers, no spaces): ")

                try:
                        f = threshs.split('\n')[0]
                        nums = f.split(';')

                        if f.find(';') == -1 or not nums[0].isdigit() or not nums[1].isdigit():
                                raise ValueError;
                        
                        file.write("## Humidity Thresholds ##\n")
                        file.write(f)

                        break
                except ValueError:
                        print("Invalid Argument - Enter Humidity thresholds as Low;high")
                        pass


        file.write('\n')

        # Get Alert Timer
        while True:
                emails = input("Enter miminum alert between emails, in minutes: ")

                try:
                        e = emails.split('\n')[0]

                        if not e.isdigit():
                                raise ValueError

                        file.write("## Alert Minimum Timer ##\n")
                        file.write(e)

                        break
                except ValueError:
                        print("Invalid Argument - enter alert as an integer, in minutes")
                        pass


        file.write('\n')

        file.close()


# Open the file to read what port to listen in on
file = open('/etc/pyFiles/portDaemonConfig.ini', 'r')

# Update the Settings
index = 0

for line in file:
        if line.find("#") == -1:
                if  index == 1:
                        ln = line[:line.find('\n')]
                else:
                        ln = line
                get_settings(index, ln)
                index = index + 1
print("Settings updated...")


## SOCKET LISTENING
# Create a connection and a general message to broadcast
connection = ('', port)
rPIAddress = None
serverConn = ('0.0.0.0', port)

MESSAGE = "BROADCASTING..."

# Set up our broadcast address
if isWindows == False:
        print("RPI Broadcast")
        print(subprocess.getoutput("ifconfig"))

        # Split based on either wifi or ethernet use.
        r1 = subprocess.getoutput("ifconfig").split("\n")[1].split()[1][5:]
        rTest = str(r1)

        if rTest.find(":") != -1:
                broadcast = subprocess.getoutput("ifconfig").split("\n")[17].split()[5][0:]
                print(broadcast)
        else:
                broadcast = subprocess.getoutput("ifconfig").split("\n")[1].split()[1][0:]
                print(broadcast)
else:
        broadcast = "192.168.1.255"
        
# UDP Connection
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 1024)
sock.bind(connection)
sock.settimeout(timeoutTime)
sock.sendto(MESSAGE.encode(), (broadcast, port))

# TCP Connection - Determines master - do not open here.
tcpSock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcpSock.settimeout(None) #timeoutTimeTCP
tcpConnection = ('0.0.0.0', port)

print("Listening for data on Port " + str(port))

# Broadcast a message saying that if a session exists and the master ip address.
NameMessage = host
MasterMessage = NameMessage + "_" + "MASTER_IP: " + str(masterAddress)

# Send the initial message over the socket
sock.sendto(MasterMessage.encode(), (broadcast, port))

### Listening Loop
check = False
threaded = False
threadListen = False

while True:
        # Receive Data while there is no master address
        while masterAddress == None:
                try:
                        #Receive Data.
                        #If no data to receive, timeout\
                        data, addr = sock.recvfrom(1024)
                        print("RCVD: ", data.decode())
                        currData = data.decode()

                        #Check the data being sent. It must have an isInSession and and IP
                        if currData.find("MASTER_IP") != -1:
                                dataList = currData.split()
                                nameList = currData.split('_')
                                
                                # Make sure this data comes from somewhere else, not own, and set the Master IP address if != None
                                # This makes the RPi a Client - if master != none
                                if nameList[0] != host and dataList[1].find("None") == -1:
                                        print("Master RPi found!")
                                        masterAddress = dataList[1]
                                        isInSession = True
                                        isMaster = False

                                        # Attempt to TCP Connect
                                        check = ConnectToServerTCP()

                                        # If our check fails, something is blocking our connection
                                        if check == False:
                                                break

                                        if nameList[0] not in piList:
                                                piList.append(nameList[0])

                                                # Ping back our own so that new arrival can see the others.
                                                sock.sendto(MasterMessage.encode(), (broadcast, port))
                                        break
                                else:
                                        # if master == None, and this RPi is not on our namelist, add to nameList, 
                                        if nameList[0] not in piList:
                                                piList.append(nameList[0])

                                                # Ping back our own so that new arrival can see the others.
                                                sock.sendto(MasterMessage.encode(), (broadcast, port))

                        # Ping Data Found, add to ping list.
                        elif currData.find("PING") != -1 and isVoting == True:
                                usingLoad = False
                                dataList = currData.split()
                                nameList = currData.split('_')
                                piPingList[nameList[0]] = float(dataList[1])

                                # Now that pings are found, determine who has the smallest ping
                                if len(piPingList) >= len(piList) and HasPinged == False:
                                        HasPinged = True
                                        print("Pings are cast...")

                                        currentVote = None
                                        for pi, piPing in piPingList.items():
                                                if piPing < smallestPing:
                                                        smallestPing = piPing
                                                        currentVote = pi

                                        # At the end of the loop, cast a vote for smallest ping
                                        voteMessage = NameMessage + "_" + "VOTE: " + currentVote
                                        sock.sendto(voteMessage.encode(), (broadcast, port))

                        # Vote by Load instead of Ping should Ping tie
                        elif currData.find("LOAD") != -1 and usingLoad == True:
                                piPingList.clear()

                                dataList = currData.split()
                                nameList = currData.split('_')
                                piLoadList[nameList[0]] = float(dataList[1])

                                if len(piLoadList) >= len(piList) and HasLoad == False:
                                        HasLoad = True
                                        currentVote = None

                                        for pi, piLoad in piLoadList.items():
                                                if piLoad < smallestLoad:
                                                        smallestLoad = piLoad
                                                        currentVote = Pi

                                        voteMessage = NameMessage + "_" + "VOTE: " + currentVote
                                        sock.sendto(voteMessage.encode(), (broadcast, port))

                                
                        # Receive the Votes. Add to Count. Broadcast own count at the end of voting.
                        elif currData.find("VOTE") != -1 and isVoting == True:
                                dataList = currData.split()
                                nameList = currData.split('_')
                                print("Vote for: " + dataList[1])

                                if nameList[0] not in votedPiList:
                                        votedPiList.append(nameList[0])

                                # Add a vote for self. Wait until completion.
                                if dataList[1] == host:
                                        votesForMe = votesForMe + 1

                                # Votes are in, broadcast your vote Count
                                if len(votedPiList) >= len(piList):
                                        vCountMessage = NameMessage + "_" + "VCOUNT: " + str(votesForMe)
                                        sock.sendto(vCountMessage.encode(), (broadcast, port))

                        # Receive the vote counts and count.
                        elif currData.find("VCOUNT") != -1 and isVoting == True:
                                dataList = currData.split()
                                nameList = currData.split('_')

                                voteList[nameList[0]] = int(dataList[1])

                                # All the votes are broadcast, now we need to determine the winner.
                                if len(voteList) >= len(piList) and HasVoted == False:
                                        piVoting = host
                                        HasVoted = True
                                        currentNumVotes = 0

                                        # Look for highest number of votes to broadcast winner.
                                        for pi, votes in voteList.items():
                                                if votes > currentNumVotes:
                                                        currentNumVotes = votes
                                                        piVoting = pi

                                        # Check for ties.
                                        tieCount = 0
                                        for pi, votes in voteList.items():
                                                if currentNumVotes == votes:
                                                    tieCount = tieCount + 1
                                                if tieCount > 1:
                                                        # First, we get the average load
                                                        if usingLoad == False and isWindows == False:
                                                                usingLoad = True
                                                                currentNumVotes = 0
                                                                print("Getting average load")
                                                                load = subprocess.getoutput("uptime | awk -F' ' '{print $11}'")

                                                        if pi < piVoting:
                                                                piVoting = pi
                                        
                                        # Now check if self is the winner...
                                        if piVoting == host:
                                                print("Vote won, making master")

                                                masterName = socket.gethostname()
                                                if isWindows == True:
                                                        masterAddress = host.split("-")[1]
                                                else:
                                                        masterAddress = socket.gethostbyname(masterName) ## This is a problem on windows. Manually set.

                                                isInSession = True

                                                # Update values
                                                MasterMessage = NameMessage + "_" + "MASTER_IP: " + str(masterAddress)
                                                isMaster = True

                                                # Open TCP Connection for Master
                                                print("Making RPi a master")
                                                OpenTCPConnection()

                                                # Broadcast to all that a Master is found.
                                                sock.sendto(MasterMessage.encode(), (broadcast, port))

                                        # if self is not the winner, we are just waiting for a response from the winner anyway, as seen above. No more code needed.

                                
                                

                # Timeout meaning none are detected - make master (if nameList is size 1)
                except socket.timeout as e:
                        print("TIMEOUT: No data being received - no more devices detected.")
                        HasPinged = False

                        # Make self a master if no other pi's are on the network.
                        if len(piList) <= 1:
                                print("No other RPi's detected")
                                masterName = socket.gethostname()

                                if isWindows == True:
                                        print("Windows")
                                        masterAddress = host.split("-")[1]
                                else:
                                        print("RPI Addressing")
                                        print(subprocess.getoutput("ifconfig"))

                                        # Split based on either wifi or ethernet use.

                                        rPIAddress = subprocess.getoutput("ifconfig").split("\n")[1].split()[1][0:]
                                        rTest = str(rPIAddress)

                                        if rTest.find(":") != -1:
                                                rPIAddress = subprocess.getoutput("ifconfig").split("\n")[17].split()[1][0:]

                                        masterAddress = rPIAddress

                                print(masterAddress)
                                isInSession = True

                                # Update values
                                MasterMessage = NameMessage + "_" + "MASTER_IP: " + str(masterAddress)
                                isMaster = True

                                # Open TCP Connection for Master
                                print("Making RPi a master")
                                OpenTCPConnection()

                                # Broadcast to all that a Master is found.
                                sock.sendto(MasterMessage.encode(), (broadcast, port))

                                break
                        else:
                                # Elect a new master and update everyone's config
                                # What if a pi arrives during election? Data is being sent, so it'll wait for election to finish.
                                print("Other RPi's detected, beginning election")

                                # If only two, do a ping comparison. If both are the same, do who arrived first.
                                if len(piList) >= 2:
                                        print(piList)
                                        isVoting = True
                                        total = 0.0
                                        for pi in piList:
                                                nameResolution = pi.split('-')[1]
                                                if nameResolution != host.split('-')[1]:
                                                        ping = Ping(nameResolution)
                                                        total = total + float(ping)
                                        averagePing = total / float(len(piList))
                                        pingMessage = NameMessage + "_PING: " + str(averagePing)
                                        sock.sendto(pingMessage.encode(), (broadcast, port))



        


        # If our TCP Connection Failed, pause to find out why. Allow the user to reboot if the user is connected. If no response, do a normal reset.
        if check == False and isMaster == False:
                start = time.time()
                end = time.time()

                print("Failure to connect to master node. Press y to reboot the Pi, n to cancel. No answer in 5 seconds will auto cancel.")
                rebooting = False
                while (end - start) < 5:
                        if isWindows == False:
                                try:
                                        with Timeout(5):
                                                print("RPI")
                                                x = str(getKey())
                                                print(x)
                                                if x == "b'y'":
                                                        rebooting = True
                                                        break
                                                elif x == "b'n'":
                                                        break
                                except Timeout.Timeout:
                                        break
                        else:
                                if keyboard.is_pressed('y'):
                                        rebooting = True
                                        break
                                elif keyboard.is_pressed('n'):
                                        break

                        end = time.time()

                if rebooting == True:
                        sock.close()
                        tcpSock.close()
                        os.system('sudo shutdown -r now')
                else:
                        print("Closed?")
                        tcpSock.close()
                        masterAddress = None
                        isInSession = False

        # Update our Nginx Config
        if updatedNginx == False:
                print("Redirecting")
                ChangeNginxConfig()
                ChangeDBConfig()
                runServeo()
                runLogger()
                updatedNginx = True

        # Continually accept TCP Connections over the server
        if isMaster == True:
                        isInSession = True

                        # LISTEN FOR TCP CONNECTIONS HERE
                        if threadListen == False:
                                threadListen = True;
                                Thread(target = ThreadedTCPListener).start()

                        # Even as a master, we must check for a "split-brain" accident. 
                        # Sometimes, a master simply gets disconnected without restart. If that happens, we need to check if we are receiving data...
                        try:
                                data, addr = sock.recvfrom(1024)
                                currData = data.decode()

                                # May deal with split brains later?
                                                        
                                # Broadcast Master IP Here when a new RPi enters!
                                MasterMessage = NameMessage + "_" + "MASTER_IP: " + str(masterAddress)
                                sock.sendto(MasterMessage.encode(), (broadcast, port))
                                # Save a number of slaves connections. If equal, basically rock paper scissors until winner.

                        # This would be the problem?
                        except socket.timeout as e:
                                print("Stopped receiving UDP data...")


                

        # If a client, with a connection to master, continually watch for a disconnect. If disconnected, set master address to none.
        # This means the master has gone down or unreachable. Also, watch for split-brain effect.
        if isMaster == False and masterAddress != None:
                isInSession = True
                connCheck = CheckTCPConnection(masterAddress)

                # Master has gone offline, reset and go back to top while loop (masterAddress == None)
                if connCheck == False:
                        print("Closed?")
                        tcpSock.close()
                        masterAddress = None
                        isInSession = False
                        updatedNginx = False
        










        

