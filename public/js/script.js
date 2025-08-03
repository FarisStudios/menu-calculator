document.addEventListener('DOMContentLoaded', () => {
    const menuList = document.getElementById('menu-list');
    const totalAmountSpan = document.getElementById('total-amount');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    let menuItems = [];
    let itemCounts = {};

    // Function to fetch menu data from the Cloudflare Pages Function
    async function fetchMenuItems() {
        try {
            const response = await fetch('/menu-data');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            menuItems = data;
            
            // Initialize item counts and render the menu
            itemCounts = {};
            menuItems.forEach(item => {
                itemCounts[item.name] = 0;
            });

            loadingMessage.classList.add('hidden');
            menuList.classList.remove('hidden');
            renderMenuItems();
            updateTotalSum();

        } catch (error) {
            console.error('Failed to fetch menu items:', error);
            loadingMessage.classList.add('hidden');
            errorMessage.classList.remove('hidden');
        }
    }

    function renderMenuItems() {
        menuList.innerHTML = ''; // Clear the list
        if (menuItems.length === 0) {
            menuList.innerHTML = '<p>No menu items found.</p>';
            return;
        }

        menuItems.forEach(item => {
            const menuItemEl = document.createElement('div');
            menuItemEl.classList.add('menu-item');
            menuItemEl.dataset.itemName = item.name;

            const itemInfo = document.createElement('div');
            itemInfo.classList.add('item-info');
            itemInfo.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} EGP</div>
            `;

            const amountCounter = document.createElement('div');
            amountCounter.classList.add('amount-counter');
            amountCounter.innerHTML = `
                <button class="counter-button decrement" data-name="${item.name}">-</button>
                <span class="counter-value">${itemCounts[item.name]}</span>
                <button class="counter-button increment" data-name="${item.name}">+</button>
            `;

            menuItemEl.appendChild(itemInfo);
            menuItemEl.appendChild(amountCounter);
            menuList.appendChild(menuItemEl);
        });
    }

    // Handle counter button clicks
    menuList.addEventListener('click', (event) => {
        const button = event.target.closest('.counter-button');
        if (!button) return;

        const itemName = button.dataset.name;
        const countSpan = button.parentElement.querySelector('.counter-value');
        let currentCount = parseInt(countSpan.textContent);

        if (button.classList.contains('increment')) {
            currentCount++;
        } else if (button.classList.contains('decrement')) {
            if (currentCount > 0) {
                currentCount--;
            }
        }

        itemCounts[itemName] = currentCount;
        countSpan.textContent = currentCount;
        updateTotalSum();
    });

    function updateTotalSum() {
        let totalSum = 0;
        menuItems.forEach(item => {
            const count = itemCounts[item.name] || 0;
            totalSum += item.price * count;
        });
        totalAmountSpan.textContent = `Total: ${totalSum.toFixed(2)} EGP`;
    }

    // Start the process
    fetchMenuItems();
});