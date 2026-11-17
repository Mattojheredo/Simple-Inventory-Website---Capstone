<?php
include 'includes/db.php';


$db->exec("CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    date_added TEXT DEFAULT CURRENT_TIMESTAMP,
    restock_level INTEGER DEFAULT 5
)");

$message = '';
$messageClass = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $category = trim($_POST['category']);
    $quantity = (int) $_POST['quantity'];
    $price = (float) $_POST['price'];
    $restockLevel = (int) $_POST['restockLevel'];

    if (empty($name) || empty($category)) {
        $message = 'Please fill in all required fields.';
        $messageClass = 'error';
    } else {
        $stmt = $db->prepare("INSERT INTO items (name, category, quantity, price, restock_level) VALUES (:name, :category, :quantity, :price, :restock_level)");
        $stmt->execute([
            ':name' => $name,
            ':category' => $category,
            ':quantity' => $quantity,
            ':price' => $price,
            ':restock_level' => $restockLevel
        ]);

        $message = 'Saved "' . htmlspecialchars($name) . '" successfully!';
        $messageClass = 'success';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Add Grocery / Household Item</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 450px; margin: 40px auto; padding: 0 16px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; font-weight: bold; margin-bottom: 5px; }
    input, select { width: 100%; padding: 8px; box-sizing: border-box; }
    button { padding: 10px 16px; background: #2563eb; color: white; border: none; cursor: pointer; width: 100%; font-size: 16px; }
    button:hover { background: #1d4ed8; }
    .error { color: #dc2626; font-size: 14px; margin-top: 10px; }
    .success { color: #16a34a; font-size: 14px; margin-top: 10px; }
    .nav-link { display: inline-block; margin-top: 15px; color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>

  <h2>Add New Item</h2>

  <form action="add-item.php" method="POST">
    <div class="form-group">
      <label for="name">Item Name *</label>
      <input type="text" id="name" name="name" placeholder="e.g., Dishwashing Liquid" required />
    </div>

    <div class="form-group">
      <label for="category">Category *</label>
      <select id="category" name="category" required>
        <option value="">-- Select Category --</option>
        <option value="Grocery">Grocery</option>
        <option value="Household">Household</option>
      </select>
    </div>

    <div class="form-group">
      <label for="quantity">Quantity *</label>
      <input type="number" id="quantity" name="quantity" min="0" step="1" placeholder="e.g., 5" required />
    </div>

    <div class="form-group">
      <label for="price">Price *</label>
      <input type="number" id="price" name="price" min="0" step="0.01" placeholder="e.g., 45.50" required />
    </div>

    <div class="form-group">
      <label for="restockLevel">Restock Level *</label>
      <input type="number" id="restockLevel" name="restockLevel" min="0" step="1" placeholder="e.g., 2" required />
    </div>

    <button type="submit">Save Item</button>
  </form>

  <?php if (!empty($message)): ?>
    <div class="<?php echo $messageClass; ?>"><?php echo $message; ?></div>
  <?php endif; ?>

  <a class="nav-link" href="view-items.php">View All Items &rarr;</a>

</body>
</html>
