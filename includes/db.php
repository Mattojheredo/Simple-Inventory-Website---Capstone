<?php
$db = new PDO('sqlite:' . __DIR__ . '/../database/inventory.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>
