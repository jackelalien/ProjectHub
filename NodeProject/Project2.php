<!DOCTYPE html>
<html>
    <head>
        <title>Project</title>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.3/Chart.bundle.min.js"></script>
    </head>
    <body>

        <?php
ob_start();
error_reporting(0);
echo "Working?";

$db_conx = mysqli_connect("localhost", "root", "", "TempData");
// Evaluate the connection
if (mysqli_connect_errno()) {
    echo mysqli_connect_error("Our database server is down at the moment. :(");
    exit();
} 

?>


        <h1>Raspberry Pi Temperature Logging System</h1>
        <table style="width:100%">
            <tr>
                <th>Current Chart</th>
                <th>Daily Chart</th>
            </tr>
            <tr>
                <td>
                    <div><canvas id="currChart" width="500" height="500"></canvas></div>
                </td>
                <td>
                    <div><canvas id="dailyChart" width="500" height="500"></canvas></div>
                    <div>
                        
                    </div>
                </td>
            </tr>
            <tr>
                <th>Monthly Chart</th>
                <th>Yearly Chart</th>
            </tr>
        </table>
        
        

<script>
    // CURRENT CHART
    var chrt = document.getElementById("currChart").getContext("2d");
    
    var data = {
   labels: [],
   datasets: []
    };
    var myFirstChart = new Chart(chrt, {
        type: 'line',
        data: data,
        options: {
            responsive: false,
        }
    });

    // Daily Chart
</script>
    </body>
</html>