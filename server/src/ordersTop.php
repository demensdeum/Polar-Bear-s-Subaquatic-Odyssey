<?php
include("config.php");

$conn = dbConnect();

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT masonic_order, 
               SUM(CASE WHEN type = 'hero' THEN 1 ELSE 0 END) AS member_count, 
               SUM(CASE WHEN type = 'building' THEN 1 ELSE 0 END) AS buildings_count, 
               SUM(balance) AS total_balance 
        FROM entities 
        WHERE masonic_order <> 'NONE'
        GROUP BY masonic_order 
        ORDER BY total_balance DESC
        LIMIT 100";


$result = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Рейтинг Масонских орденов</title>
    <style>
        table {
            border-collapse: collapse;
            width: 50%;
            margin: 20px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>

    <h1>Рейтинг Масонских орденов</h1>

    <?php
        if ($result->num_rows > 0) {
            echo "<table>";
            echo "<tr><th>Масонский орден</th><th>Общий баланс</th><th>Количество членов</th><th>Количество зданий</th></tr>";

            while($row = $result->fetch_assoc()) {
                echo "<tr><td>" . $row["masonic_order"] . "</td><td>" . $row["total_balance"] . "</td><td>" . $row["member_count"] . "</td><td>" . $row["buildings_count"] . "</td></tr>";
            }

            echo "</table>";
        } else {
            echo "Нет данных для отображения";
        }
    ?>

    <?php
        $conn->close();
    ?>

</body>
</html>