<?php
include 'includes/db.php';
$items = $db->query('SELECT * FROM items')->fetchAll(PDO::FETCH_ASSOC);
?>
<table border="1">
  <?php foreach ($items as $item): ?>
  <tr>
    <td><?= htmlspecialchars($item['name']) ?></td>
    <td><?= $item['quantity'] ?></td>
    <td><?= $item['price'] ?></td>
  </tr>
  <?php endforeach; ?>
</table>
