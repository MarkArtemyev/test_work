<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $manufacturer = $data['manufacturer'];
        $name = $data['name'];
        $price = $data['price'];
        $quantity = $data['quantity'];
        $productString = "$manufacturer :: $name :: $price :: $quantity\n";

        if (!file_exists('products.txt')) {
            touch('products.txt');
        }

        file_put_contents('products.txt', $productString, FILE_APPEND);
        echo json_encode(['message' => 'Товар успешно добавлен.']);
    } else {
        echo json_encode(['error' => 'Ошибка в данных.']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $products = [];
    if (file_exists('products.txt')) {
        $lines = file('products.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $productData = explode(' :: ', $line);
            if (count($productData) === 4) {
                $products[] = [
                    'manufacturer' => $productData[0],
                    'name' => $productData[1],
                    'price' => floatval($productData[2]),
                    'quantity' => intval($productData[3])
                ];
            }
        }
    }
    echo json_encode($products);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $idToDelete = $data['id'];
    if (file_exists('products.txt')) {
        $lines = file('products.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $newLines = [];
        foreach ($lines as $line) {
            $productData = explode(' :: ', $line);
            if (count($productData) === 4) {
                $productId = end($productData);
                if ($productId != $idToDelete) {
                    $newLines[] = $line;
                }
            }
        }
        file_put_contents('products.txt', implode("\n", $newLines));
        echo json_encode(['message' => 'Товар успешно удален.']);
    } else {
        echo json_encode(['error' => 'Файл данных не найден.']);
    }
}
?>