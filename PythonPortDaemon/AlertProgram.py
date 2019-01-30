import socket
import os


s = socket.socket()
port = 12000

numHosts = input("Enter number of nodes installed: ")
print("This may get a little tedious, but it works for now.")
print("Be sure to know your node addresses when they are configured!")
hosts = []

for i in range(0,int(numHosts)):
    hosts.append(input("Enter known node IP Address: "))

while True:
    try:
        for x in hosts:
            try:
                s = socket.socket()
                s.connect((x, port))
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                data = s.recv(1024)
                print(data)
                s.close()
            except Exception as e:
                print("Could not connect: " + e)
                s.close()
                continue
    except:
        pass

    
        


