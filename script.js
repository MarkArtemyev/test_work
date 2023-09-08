document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('product-form');
    const productTable = document.getElementById('product-table');
    const productList = document.getElementById('product-list');
    const totalPrice = document.getElementById('total-price');
    const totalQuantity = document.getElementById('total-quantity');
    const addButton = document.getElementById('add-product'); 

    addButton.addEventListener('click', function () {
        const manufacturer = document.getElementById('manufacturer').value;
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (manufacturer && name && !isNaN(price) && !isNaN(quantity)) {
            addProduct(manufacturer, name, price, quantity);
        } else {
            alert('Пожалуйста, заполните все поля корректно.');
        }
    });

    function addProduct(manufacturer, name, price, quantity) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${manufacturer}</td>
            <td>${name}</td>
            <td>${price}</td>
            <td>${quantity}</td>
            <td><button class="delete-button" data-id="${Date.now()}">Удалить</button></td>
        `;
        
        productList.appendChild(newRow);
        
        document.getElementById('manufacturer').value = '';
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';
        
        updateTotals();
        
        const data = { manufacturer, name, price, quantity };
        sendDataToServer(data);
    }
    
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const manufacturer = document.getElementById('manufacturer').value;
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (manufacturer && name && !isNaN(price) && !isNaN(quantity)) {
            addProduct(manufacturer, name, price, quantity);
        } else {
            alert('Пожалуйста, заполните все поля корректно.');
        }
    });
    
    productTable.addEventListener('click', function (e) {
        if (e.target && e.target.className == 'delete-button') {
            deleteProduct(e.target.getAttribute('data-id'));
        }
    });
    
    function deleteProduct(id) {
        const rowToDelete = document.querySelector(`.delete-button[data-id="${id}"]`).parentNode.parentNode;
        productList.removeChild(rowToDelete);
        updateTotals();
        
        sendDeleteRequestToServer(id);
    }
    
    function sendDataToServer(data) {
        fetch('server.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
    }
    
    function sendDeleteRequestToServer(id) {
        fetch(`server.php?id=${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Ошибка удаления товара');
            }
        })
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
    }
    
    function updateTotals() {
        let totalP = 0;
        let totalQ = 0;
        const rows = productList.getElementsByTagName('tr');
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].getElementsByTagName('td');
            const price = parseFloat(cols[2].textContent);
            const quantity = parseInt(cols[3].textContent);
            totalP += price;
            totalQ += quantity;
        }
        totalPrice.textContent = totalP.toFixed(2);
        totalQuantity.textContent = totalQ;
    }
    
    function sortTable(column) {
        const table = document.getElementById('product-table');
        const rows = Array.from(table.getElementsByTagName('tr'));
        const header = rows[0].getElementsByTagName('th')[column];
        const sortOrder = header.getAttribute('data-sort-order');
        const isNumeric = column === 2 || column === 3;
        
        rows.shift();
        
        rows.sort((a, b) => {
            const aValue = a.getElementsByTagName('td')[column].textContent;
            const bValue = b.getElementsByTagName('td')[column].textContent;
            
            if (isNumeric) {
                return parseFloat(aValue) - parseFloat(bValue);
            } else {
                return aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            }
        });
        
        if (sortOrder === 'asc') {
            rows.reverse();
            header.setAttribute('data-sort-order', 'desc');
        } else {
            header.setAttribute('data-sort-order', 'asc');
        }
        
        for (let i = 0; i < rows.length; i++) {
            table.appendChild(rows[i]);
        }
    }
});
