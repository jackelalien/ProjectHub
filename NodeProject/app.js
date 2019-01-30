// Some notes:
// Project folders are provided.
// EJS uses a views folder (Project.ejs)
// RUN NODE JS with --expose-gc
// Maybe this could also be reverse-proxied through Nginx

// Setup Variables
const express = require('express');
const app = express();
var path = require('path');
const mariadb = require('mariadb');
var http = require('http').Server(app);
var io = require('socket.io')(http);
global.RPis = [];
global.RSet = false;
global.newDay = false;
global.currDay = -1;
global.objectArray = [];
global.objectArray_H = [];
global.subObjArray = [];

// Creates our initial connection to the mariadb server.
// No changes needed here.
mariadb.createConnection({ // Open a new connection                                                                                                                                           
    user: 'root',
    host: 'localhost',
    port: 3306,
    database: 'TempData'
})
    .then(conn => {
        // This is just to show it's running. Keep the connection open.
        RPis = [];
        conn.query('SHOW TABLES') // Execute a query                                                                                                                                
            .then(result => { // Print the results                                                                                                                                            
                for (row of result) {
                    r = row.Tables_in_tempdata
                    RPis.push(r);
                    console.log(r)
                }
                RSet = true;
                console.log("Running!");
                loopData(conn, 0);
            })                                                                                                                                   
    })


// Async Function that loops and gets our current data
// No changes needed here.
async function loopData(conn, r) {
    if(RSet)
    {
        // Go through each of the pis, which we established earlier.    
            // Get the Data
            var date = new Date();
            var currentDay = date.getDate();
            var currentMonth = date.getMonth() + 1;
            var currentYear = date.getFullYear();
            var currentDate = currentYear + "-" + currentMonth + "-" + currentDay;
            
            // Check the current day
            if(currDay != currentDay)
            {
                if(currDay != -1)
                    newDay = true
                currDay = currentDay;
            }

            //If the date has changed, clear the data array
            if(newDay)
            {
                dataArray = []
                newDay = false;
            }

            // Now go through each and update the current data chart
            // The current chart shows times from 12:00 AM to 11:59PM
            conn.query('SELECT * FROM ' + RPis[r] + ' WHERE tdate = \"' + currentDate + '\"')
            .then(result => {
                
                // Get a unique color for the Pi
                var color = colorHash(RPis[r])
                rA = color.r;
                g = color.g
                b = color.b

                // Assign a blank jsonObj for each.
                var jsonObj = {
                    label: RPis[r],
                    lineTension: 0,
                    backgroundColor: "rgba("+rA+","+g+","+b+",0.2)",
                    borderColor: "rgba("+rA+","+g+","+b+",1.0)",
                    hoverBackgroundColor: "rgba(220,220,220,0.75)",
                    hoverBorderColor: "rgba(220,220,220,1)",
                    data: []
                }   

                // Check if an object exists. If so, assign.
                for (var i = 0; i < objectArray.length; i++) {
                    if (objectArray[i].label === RPis[r]) {
                        jsonObj = objectArray[i]
                    }
                }

                // Go through each row and push the temperature data.
                 for (row of result) {
                    // Split the time from ttime.
                    // This changes the data to be pushed to the client-side.
                     var splitTime = row.ttime.split(":")
                     var d = new Date();
                     d.setHours(splitTime[0])
                     d.setMinutes(splitTime[1])
                     d.setSeconds(splitTime[2])
                     var testData = {
                         x: d,
                         y: row.temperature
                     }
                     var check = true;

                     
                     // This checks and makes sure this data doesn't already exist.
                     for(var i = 0; i < jsonObj.data.length; i++)
                     {
                         
                        if(jsonObj.data[i].x.getHours() == testData.x.getHours() &&
                        jsonObj.data[i].x.getMinutes() == testData.x.getMinutes() &&
                        jsonObj.data[i].x.getSeconds() == testData.x.getSeconds() && jsonObj.data[i].y == row.temperature)
                        {
                            check = false;

                        }
                            
                     }
                         
                     // If data is not the same, push it to the testData array.
                     if(check)
                     {
                        jsonObj.data.push(testData)
                        console.log("Pushed " + testData.x + " - " + RPis[r])
                     }      
                }

                // If the object array doesn't have the object, push it.
                if(objectArray.includes(jsonObj) == false)
                {
                    objectArray.push(jsonObj);
                    console.log(jsonObj)
                }


                // Do this for each of the Pis.
                var nr = r + 1
                if((r+1) >= RPis.length)
                    nr = 0
            
                setTimeout(function(){ loopData(conn, nr) }, 2000)
            });    
    }       
}

// Here's the humidity version of it.
// THIS IS UNTESTED - MAY NEED CHANGES
async function loopData_H(conn, r) {
    if(RSet)
    {
        // Go through each of the pis, which we established earlier.    
            // Get the Data
            var date = new Date();
            var currentDay = date.getDate();
            var currentMonth = date.getMonth() + 1;
            var currentYear = date.getFullYear();
            var currentDate = currentYear + "-" + currentMonth + "-" + currentDay;
            
            // Check the current day
            if(currDay != currentDay)
            {
                if(currDay != -1)
                    newDay = true
                currDay = currentDay;
            }

            //If the date has changed, clear the data array
            if(newDay)
            {
                dataArray = []
                newDay = false;
            }

            // Now go through each and update the current data chart
            // The current chart shows times from 12:00 AM to 11:59PM
            conn.query('SELECT * FROM ' + RPis[r] + ' WHERE tdate = \"' + currentDate + '\"')
            .then(result => {
                
                // Get a unique color for the Pi
                var color = colorHash(RPis[r])
                rA = color.r;
                g = color.g
                b = color.b

                // Assign a blank jsonObj for each.
                var jsonObj = {
                    label: RPis[r],
                    lineTension: 0,
                    backgroundColor: "rgba("+rA+","+g+","+b+",0.2)",
                    borderColor: "rgba("+rA+","+g+","+b+",1.0)",
                    hoverBackgroundColor: "rgba(220,220,220,0.75)",
                    hoverBorderColor: "rgba(220,220,220,1)",
                    data: []
                }   

                // Check if an object exists. If so, assign.
                for (var i = 0; i < objectArray_H.length; i++) {
                    if (objectArray_H[i].label === RPis[r]) {
                        jsonObj = objectArray_H[i]
                    }
                }

                // Go through each row and push the temperature data.
                 for (row of result) {
                    // Split the time from ttime.
                    // This changes the data to be pushed to the client-side.
                     var splitTime = row.ttime.split(":")
                     var d = new Date();
                     d.setHours(splitTime[0])
                     d.setMinutes(splitTime[1])
                     d.setSeconds(splitTime[2])
                     var testData = {
                         x: d,
                         y: row.humidity
                     }
                     var check = true;

                     
                     // This checks and makes sure this data doesn't already exist.
                     for(var i = 0; i < jsonObj.data.length; i++)
                     {
                         
                        if(jsonObj.data[i].x.getHours() == testData.x.getHours() &&
                        jsonObj.data[i].x.getMinutes() == testData.x.getMinutes() &&
                        jsonObj.data[i].x.getSeconds() == testData.x.getSeconds() && jsonObj.data[i].y == row.temperature)
                        {
                            check = false;

                        }
                            
                     }
                         
                     // If data is not the same, push it to the testData array.
                     if(check)
                     {
                        jsonObj.data.push(testData)
                        console.log("Pushed " + testData.x + " - " + RPis[r])
                     }      
                }

                // If the object array doesn't have the object, push it.
                if(objectArray_H.includes(jsonObj) == false)
                {
                    objectArray_H.push(jsonObj);
                    console.log(jsonObj)
                }


                // Do this for each of the Pis.
                var nr = r + 1
                if((r+1) >= RPis.length)
                    nr = 0
            
                setTimeout(function(){ loopData_H(conn, nr) }, 2000)
            });    
    }       
}

// Create a query that could relate to month, date, etc.
/// PARAMS:
/// - qryPt1 - the query BEFORE the table name
/// - qryPt2 - the query AFTER the table name
/// -- Side note: DO NOT INCLUDE table name, the RPi Array handles this.
/// - i - The index value of the table array to select.
/// - sockEmit - The socket emission function to call at the end of the loop
/// - isTemp - Checks if Temperature or Humidity
// Changes could be made here, potentially. Most likely not.
function createQuery(qryPt1, qryPt2, i, sockEmitFunc, isTemp)
{
        // Create the query
        var qry = qryPt1 + RPis[i] + qryPt2;
        console.log(qry)
        mariadb.createConnection({ // Open a new connection - just for the main update.                                                                                                                                           
            user: 'root',
            host: 'localhost',
            port: 3306,
            database: 'TempData'
        })
        .then(conn => {
            conn.query(qry) // Execute a query                                                                                                                                
            .then(result => { 

                // Give each pi a unique color
                var color = colorHash(RPis[i])
                rA = color.r;
                g = color.g
                b = color.b

                // Assign a blank JSON object for each.
                // JSON objects will include the RPI name, linetension for the chart,
                // chart colors, and an empty data array.
                var jsonObj = {
                    label: RPis[i],
                    lineTension: 0,
                    backgroundColor: "rgba("+rA+","+g+","+b+",0.2)",
                    borderColor: "rgba("+rA+","+g+","+b+",1.0)",
                    hoverBackgroundColor: "rgba(220,220,220,0.75)",
                    hoverBorderColor: "rgba(220,220,220,1)",
                    data: []
                }

                // Go through each result found.
                for (row of result) {

                    var valData = row.temperature
                    if(!isTemp)
                        valData = row.humidity


                    // Add the time and the temperature data.
                    var splitTime = row.ttime.split(":")
                    var d = new Date();
                    d.setHours(splitTime[0])
                    d.setMinutes(splitTime[1])
                    d.setSeconds(splitTime[2])
                    var testData = {
                        x: d,
                        y: valData
                    }

                    jsonObj.data.push(testData)
                }

                // Push to the array
                subObjArray.push(jsonObj)
                
                // Do this for each Pi
                var ni = i + 1
                if(ni >= RPis.length)
                {    
                    console.log(subObjArray[0])
                    console.log(subObjArray[1])
                    console.log(subObjArray[2])
                    io.sockets.emit(sockEmitFunc, subObjArray)
                }
                else
                {
                    // Create the query for the next pi
                    createQuery(qryPt1,qryPt2, ni, sockEmitFunc)
                }
            })
            .then(conn.destroy()) // Close the connection                                                                                                                                     
        })
    
}


// Route for the home page
// No Changes needed
app.get('/', function(req,res) {
    //res.sendFile(path.join(__dirname  + '/Project.html'));
    res.render('Project.ejs', { data: objectArray})
})

// Start the timer Function, which calls our main update.
setTimeout(timerAlpha, 1000);

// Timer Function - emits the update to socket.io
async function timerAlpha() {
    console.log("Updating...")
    // Tell the client we are updating with new temp/hum values
    io.sockets.emit('update', objectArray)
    io.sockets.emit('update_H', objectArray_H)

    // Garbage collection.
    global.gc()

    // Run the function again, every 10 seconds.
    setTimeout(timerAlpha, 10000)

}

// Test a connection on the socket.
io.on('connection', function(socket) {
 console.log('IO Connected')

// TEMPERATURE SOCKET CHANGES
// Any updates should follow the sample below
 socket.on('beginDayChange', function(data_val) {
     subObjArray = []
    // Table goes in between queries.
    // Create a new query 
    createQuery("SELECT * FROM ", " WHERE tdate =" + '\"' + data_val + '\"', 0, 'update_daily', true)

 });

 socket.on('beginMonthChange', function(data_val) {
    subObjArray = []
    var ct = new Date()
    var m = data_val[5] + data_val[6]
    var year = ct.getFullYear()
    createQuery("SELECT * FROM ", " WHERE tdate LIKE " + '\"%-' + m + '-%\" AND tdate LIKE \"%' + year + '%\"', 0, 'update_monthly', true)
 });


 // HERE'S WHERE IMPLEMENTATION NEEDS TO BE DONE
 socket.on('beginWeekChange', function(data_val) {
     subObjArray = []
     var ct = new Date();
     

 })

 socket.on('beginYearChange', function(data_val) {
    subObjArray = []
    var ct = new Date();
    

})

 socket.on('beginDayChange_H', function(data_val) {
    subObjArray = []
    var ct = new Date();
    

})

socket.on('beginMonthChange_H', function(data_val) {
    subObjArray = []
    var ct = new Date();
    

})

socket.on('beginWeekChange_H', function(data_val) {
    subObjArray = []
    var ct = new Date();
    

})

socket.on('beginYearChange_H', function(data_val) {
    subObjArray = []
    var ct = new Date();
    

})

// END IMPLEMENTATION SECTION


 socket.on('disconnect', function() {
     console.log("disconnected")
    delete io.sockets[socket.id];
    delete io.sockets.sockets[socket.id];
    console.log("Garbage collection")
    global.gc()
});

})

// Listen on a port.
// TODO: READ THIS FROM A CONFIG FILE - SO WE CAN SELECT A PORT
http.listen(22000, function() {
    console.log("Listening on 8080!");
});

// Compute a Color Hash
function colorHash(inputString){
	var sum = 0;
	
	for(var i in inputString){
		sum += inputString.charCodeAt(i);
	}

	r = ~~(('0.'+Math.sin(sum+1).toString().substr(6))*256);
	g = ~~(('0.'+Math.sin(sum+2).toString().substr(6))*256);
	b = ~~(('0.'+Math.sin(sum+3).toString().substr(6))*256);

	var rgb = "rgb("+r+", "+g+", "+b+")";

	var hex = "#";

	hex += ("00" + r.toString(16)).substr(-2,2).toUpperCase();
	hex += ("00" + g.toString(16)).substr(-2,2).toUpperCase();
	hex += ("00" + b.toString(16)).substr(-2,2).toUpperCase();

	return {
		 r: r
		,g: g
		,b: b
		,rgb: rgb
		,hex: hex
	};
}
