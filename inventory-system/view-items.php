<?php
include 'includes/db.php';

$error = '';
$back = 'view-items.php' . ($_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : '');

// ---------- Handle add / update / delete ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = (int)($_POST['id'] ?? 0);

    $name     = trim($_POST['name'] ?? '');
    $quantity = $_POST['quantity'] ?? '';
    $price    = $_POST['price'] ?? '';
    $category = trim($_POST['category'] ?? '');
    $restock  = $_POST['restock_level'] ?? 5;

    if ($action === 'delete') {
        $stmt = $db->prepare('DELETE FROM items WHERE id = ?');
        $stmt->execute([$id]);
        header('Location: ' . $back);
        exit;
    }

    if ($action === 'add' || $action === 'update') {
        if ($name === '' || !is_numeric($quantity) || !is_numeric($price)) {
            $error = 'Name, quantity and price are required (quantity and price must be numbers).';
        } else {
            if ($action === 'add') {
                $stmt = $db->prepare(
                    'INSERT INTO items (name, quantity, price, category, restock_level)
                     VALUES (?, ?, ?, ?, ?)'
                );
                $stmt->execute([$name, (int)$quantity, (float)$price, $category, (int)$restock]);
            } else {
                $stmt = $db->prepare(
                    'UPDATE items
                     SET name = ?, quantity = ?, price = ?, category = ?, restock_level = ?
                     WHERE id = ?'
                );
                $stmt->execute([$name, (int)$quantity, (float)$price, $category, (int)$restock, $id]);
            }
            header('Location: ' . $back);
            exit;
        }
    }
}

// ---------- Search and category filter ----------
$search = trim($_GET['q'] ?? '');
$filterCat = trim($_GET['category'] ?? '');

$where = [];
$params = [];
if ($search !== '') {
    $where[] = '(name LIKE ? OR category LIKE ?)';
    $params[] = '%' . $search . '%';
    $params[] = '%' . $search . '%';
}
if ($filterCat !== '') {
    $where[] = 'category = ?';
    $params[] = $filterCat;
}

$sql = 'SELECT * FROM items';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY id DESC';

$stmt = $db->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

$categories = $db->query(
    "SELECT DISTINCT category FROM items WHERE category IS NOT NULL AND category <> '' ORDER BY category"
)->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inbentore test</title>
  <link rel="stylesheet" href="/CSS/table.css">
</head>
<body class="items-page">
<div class="layout">
<main>

  <h1>Inbentore test</h1>

  <?php if ($error): ?>
    <p class="error"><?= htmlspecialchars($error) ?></p>
  <?php endif; ?>

  <!-- Search and filter (GET) -->
  <form class="toolbar" method="get" action="view-items.php">
    <input type="text" name="q" placeholder="Search name or category" value="<?= htmlspecialchars($search) ?>">
    <select name="category" onchange="this.form.submit()">
      <option value="">All categories</option>
      <?php foreach ($categories as $cat): ?>
        <option value="<?= htmlspecialchars($cat) ?>" <?= $cat === $filterCat ? 'selected' : '' ?>>
          <?= htmlspecialchars($cat) ?>
        </option>
      <?php endforeach; ?>
    </select>
    <button type="submit" class="btn btn-search">Search</button>
    <a href="view-items.php" class="btn btn-clear">Clear</a>
  </form>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Category</th>
          <th>Restock level</th>
          <th>Date added</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>

        <!-- Add new item row -->
        <tr class="add-row">
          <td><input type="text" name="name" form="form-add" placeholder="New item name" required></td>
          <td><input type="number" name="quantity" form="form-add" value="0" min="0" required></td>
          <td><input type="number" name="price" form="form-add" value="0" step="0.01" min="0" required></td>
          <td><input type="text" name="category" form="form-add"></td>
          <td><input type="number" name="restock_level" form="form-add" value="5" min="0"></td>
          <td></td>
          <td class="actions">
            <form id="form-add" method="post"></form>
            <button type="submit" form="form-add" name="action" value="add" class="btn btn-add">Add</button>
          </td>
        </tr>

        <!-- Existing items -->
        <?php foreach ($items as $item): ?>
          <?php $fid = 'form-' . (int)$item['id']; ?>
          <tr class="<?= $item['quantity'] <= $item['restock_level'] ? 'low' : '' ?>">
            <td><input type="text" name="name" form="<?= $fid ?>" value="<?= htmlspecialchars($item['name']) ?>" required></td>
            <td><input type="number" name="quantity" form="<?= $fid ?>" value="<?= (int)$item['quantity'] ?>" min="0" required></td>
            <td><input type="number" name="price" form="<?= $fid ?>" value="<?= htmlspecialchars($item['price']) ?>" step="0.01" min="0" required></td>
            <td><input type="text" name="category" form="<?= $fid ?>" value="<?= htmlspecialchars($item['category'] ?? '') ?>"></td>
            <td><input type="number" name="restock_level" form="<?= $fid ?>" value="<?= (int)$item['restock_level'] ?>" min="0"></td>
            <td><?= htmlspecialchars($item['date_added']) ?></td>
            <td class="actions">
              <form id="<?= $fid ?>" method="post"></form>
              <input type="hidden" name="id" form="<?= $fid ?>" value="<?= (int)$item['id'] ?>">
              <button type="submit" form="<?= $fid ?>" name="action" value="update" class="btn btn-edit">Save</button>
              <button type="submit" form="<?= $fid ?>" name="action" value="delete" class="btn btn-del"
                      onclick="return confirm('Delete this item?');">Delete</button>
            </td>
          </tr>
        <?php endforeach; ?>

        <?php if (!$items): ?>
          <tr>
            <td colspan="7" class="empty">
              <?= ($search !== '' || $filterCat !== '') ? 'No items match your search.' : 'No items yet. Add one in the top row.' ?>
            </td>
          </tr>
        <?php endif; ?>

      </tbody>
    </table>
  </div>

</main>
</div>
</body>
</html>