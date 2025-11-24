// Data storage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

// Category details
const categoryDetails = {
    // Expense categories
    food: { name: 'Food & Dining', color: '#f72585', icon: 'fas fa-utensils' },
    housing: { name: 'Housing', color: '#f8961e', icon: 'fas fa-home' },
    transportation: { name: 'Transportation', color: '#4cc9f0', icon: 'fas fa-car' },
    entertainment: { name: 'Entertainment', color: '#7209b7', icon: 'fas fa-film' },
    shopping: { name: 'Shopping', color: '#4361ee', icon: 'fas fa-shopping-bag' },
    healthcare: { name: 'Healthcare', color: '#4ade80', icon: 'fas fa-heartbeat' },
    utilities: { name: 'Utilities', color: '#ff9e00', icon: 'fas fa-bolt' },
    other: { name: 'Other', color: '#6c757d', icon: 'fas fa-receipt' },
    
    // Income categories
    salary: { name: 'Salary', color: '#4cc9f0', icon: 'fas fa-money-check' },
    freelance: { name: 'Freelance', color: '#7209b7', icon: 'fas fa-laptop-code' },
    business: { name: 'Business', color: '#f8961e', icon: 'fas fa-briefcase' },
    investment: { name: 'Investment', color: '#4ade80', icon: 'fas fa-chart-line' },
    gift: { name: 'Gift', color: '#f72585', icon: 'fas fa-gift' },
    rental: { name: 'Rental Income', color: '#4361ee', icon: 'fas fa-building' },
    refund: { name: 'Refund', color: '#ff9e00', icon: 'fas fa-undo' },
    other_income: { name: 'Other Income', color: '#6c757d', icon: 'fas fa-money-bill-wave' }
};

// DOM elements
const transactionForm = document.getElementById('transaction-form');
const budgetForm = document.getElementById('budget-form');
const recentTransactionsList = document.getElementById('recent-transactions');
const allTransactionsList = document.getElementById('all-transactions');
const expenseCategoriesList = document.getElementById('expense-categories');
const budgetOverviewList = document.getElementById('budget-overview');
const budgetsList = document.getElementById('budgets-list');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceChangeEl = document.getElementById('balance-change');
const clearAllTransactionsBtn = document.getElementById('clear-all-transactions');
const viewAllTransactionsBtn = document.getElementById('view-all-transactions');
const setBudgetBtn = document.getElementById('set-budget-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for transaction date
    document.getElementById('transaction-date').valueAsDate = new Date();
    
    // Load initial data
    updateDashboard();
    renderTransactions();
    renderBudgets();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Transaction form submission
    transactionForm.addEventListener('submit', handleTransactionSubmit);
    
    // Budget form submission
    budgetForm.addEventListener('submit', handleBudgetSubmit);
    
    // Clear all transactions
    clearAllTransactionsBtn.addEventListener('click', clearAllTransactions);
    
    // View all transactions
    viewAllTransactionsBtn.addEventListener('click', () => switchTab('transactions'));
    
    // Set budget button
    setBudgetBtn.addEventListener('click', () => switchTab('budgets'));
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });
    
    // Transaction type change - update categories dynamically
    document.getElementById('transaction-type').addEventListener('change', function() {
        updateTransactionCategories(this.value);
    });
    
    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('nav ul').classList.toggle('show');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('nav ul').classList.remove('show');
        });
    });
}

// Update transaction categories based on selected type
function updateTransactionCategories(type) {
    const categorySelect = document.getElementById('transaction-category');
    const categoryLabel = document.querySelector('label[for="transaction-category"]');
    
    // Clear existing options
    categorySelect.innerHTML = '';
    
    if (type === 'income') {
        // Add income categories
        const incomeCategories = [
            { value: 'salary', name: 'Salary' },
            { value: 'freelance', name: 'Freelance' },
            { value: 'business', name: 'Business' },
            { value: 'investment', name: 'Investment' },
            { value: 'gift', name: 'Gift' },
            { value: 'rental', name: 'Rental Income' },
            { value: 'refund', name: 'Refund' },
            { value: 'other_income', name: 'Other Income' }
        ];
        
        incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Update label
        categoryLabel.textContent = 'Income Category';
        
    } else {
        // Add expense categories
        const expenseCategories = [
            { value: 'food', name: 'Food & Dining' },
            { value: 'housing', name: 'Housing' },
            { value: 'transportation', name: 'Transportation' },
            { value: 'entertainment', name: 'Entertainment' },
            { value: 'shopping', name: 'Shopping' },
            { value: 'healthcare', name: 'Healthcare' },
            { value: 'utilities', name: 'Utilities' },
            { value: 'other', name: 'Other' }
        ];
        
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Update label
        categoryLabel.textContent = 'Expense Category';
    }
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const date = document.getElementById('transaction-date').value;
    
    if (!amount || !description || !date) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }
    
    // Create new transaction
    const newTransaction = {
        id: Date.now(),
        type,
        amount,
        category,
        description,
        date
    };
    
    // Add to transactions array
    transactions.push(newTransaction);
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Update UI
    updateDashboard();
    renderTransactions();
    
    // Show success message
    showNotification('Transaction added successfully!', 'success');
    
    // Reset form but keep the transaction type as it was
    transactionForm.reset();
    document.getElementById('transaction-date').valueAsDate = new Date();
    
    // Reset to default expense categories after submission
    updateTransactionCategories('expense');
}

// Handle budget form submission
function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    
    if (!amount || amount <= 0) {
        showNotification('Budget amount must be greater than 0', 'error');
        return;
    }
    
    // Check if budget already exists for this category
    const existingBudgetIndex = budgets.findIndex(b => b.category === category);
    
    if (existingBudgetIndex !== -1) {
        // Update existing budget
        budgets[existingBudgetIndex].amount = amount;
        showNotification('Budget updated successfully!', 'success');
    } else {
        // Add new budget
        budgets.push({
            category,
            amount
        });
        showNotification('Budget set successfully!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Update UI
    updateDashboard();
    renderBudgets();
    
    // Reset form
    budgetForm.reset();
}

// Delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
    renderTransactions();
    showNotification('Transaction deleted', 'success');
}

// Delete a budget
function deleteBudget(category) {
    budgets = budgets.filter(budget => budget.category !== category);
    localStorage.setItem('budgets', JSON.stringify(budgets));
    updateDashboard();
    renderBudgets();
    showNotification('Budget deleted', 'success');
}

// Clear all transactions
function clearAllTransactions() {
    if (transactions.length === 0) {
        showNotification('No transactions to clear', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
        transactions = [];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        renderTransactions();
        showNotification('All transactions cleared', 'success');
    }
}

// Update dashboard with current data
function updateDashboard() {
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalBalance = totalIncome - totalExpenses;
    
    // Update UI
    totalBalanceEl.textContent = `₹${totalBalance.toFixed(2)}`;
    totalIncomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
    
    // Update balance change indicator
    if (transactions.length > 0) {
        const lastMonthIncome = calculateLastMonthIncome();
        const lastMonthExpenses = calculateLastMonthExpenses();
        const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
        
        if (lastMonthBalance !== 0) {
            const change = ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
            const changeAmount = totalBalance - lastMonthBalance;
            
            if (change > 0) {
                balanceChangeEl.innerHTML = `<i class="fas fa-arrow-up"></i><span>+₹${Math.abs(changeAmount).toFixed(2)} (${change.toFixed(1)}%) from last month</span>`;
                balanceChangeEl.className = 'balance-change positive';
            } else if (change < 0) {
                balanceChangeEl.innerHTML = `<i class="fas fa-arrow-down"></i><span>-₹${Math.abs(changeAmount).toFixed(2)} (${Math.abs(change).toFixed(1)}%) from last month</span>`;
                balanceChangeEl.className = 'balance-change negative';
            } else {
                balanceChangeEl.innerHTML = `<i class="fas fa-minus"></i><span>No change from last month</span>`;
                balanceChangeEl.className = 'balance-change';
            }
        } else {
            balanceChangeEl.innerHTML = `<i class="fas fa-plus"></i><span>Starting fresh this month</span>`;
            balanceChangeEl.className = 'balance-change positive';
        }
    } else {
        balanceChangeEl.innerHTML = `<i class="fas fa-minus"></i><span>No transactions yet</span>`;
        balanceChangeEl.className = 'balance-change';
    }
    
    // Update expense categories
    updateExpenseCategories();
    
    // Update budget overview
    updateBudgetOverview();
}

// Calculate last month's income
function calculateLastMonthIncome() {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    return transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'income' && 
                   transactionDate.getMonth() === lastMonth.getMonth() &&
                   transactionDate.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

// Calculate last month's expenses
function calculateLastMonthExpenses() {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    return transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate.getMonth() === lastMonth.getMonth() &&
                   transactionDate.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

// Update expense categories breakdown
function updateExpenseCategories() {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
        expenseCategoriesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-pie"></i>
                <h3>No Expenses Yet</h3>
                <p>Add expense transactions to see category breakdown</p>
            </div>
        `;
        return;
    }
    
    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categories = {};
    expenseTransactions.forEach(transaction => {
        if (!categories[transaction.category]) {
            categories[transaction.category] = 0;
        }
        categories[transaction.category] += transaction.amount;
    });
    
    // Create HTML for each category
    let categoriesHTML = '';
    for (const [category, amount] of Object.entries(categories)) {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        const categoryInfo = categoryDetails[category] || categoryDetails.other;
        
        categoriesHTML += `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${categoryInfo.color};"></div>
                    <span class="category-name">${categoryInfo.name}</span>
                </div>
                <div class="category-amount">₹${amount.toFixed(2)}</div>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${percentage}%; background-color: ${categoryInfo.color};"></div>
            </div>
        `;
    }
    
    expenseCategoriesList.innerHTML = categoriesHTML;
}

// Update budget overview
function updateBudgetOverview() {
    if (budgets.length === 0) {
        budgetOverviewList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h3>No Budgets Set</h3>
                <p>Set budgets to track your spending</p>
            </div>
        `;
        return;
    }
    
    let budgetHTML = '';
    
    budgets.forEach(budget => {
        const categoryInfo = categoryDetails[budget.category] || categoryDetails.other;
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = Math.min((spent / budget.amount) * 100, 100);
        const remaining = budget.amount - spent;
        const status = remaining >= 0 ? 'Under budget' : 'Over budget';
        const statusClass = remaining >= 0 ? 'positive' : 'negative';
        
        budgetHTML += `
            <div class="budget-item">
                <div class="budget-info">
                    <h4>${categoryInfo.name}</h4>
                    <p>₹${spent.toFixed(2)} of ₹${budget.amount.toFixed(2)} • <span class="${statusClass}">${status}</span></p>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%; background-color: ${categoryInfo.color};"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    budgetOverviewList.innerHTML = budgetHTML;
}

// Render transactions lists
function renderTransactions() {
    renderRecentTransactions();
    renderAllTransactions();
}

// Render recent transactions (last 5)
function renderRecentTransactions() {
    if (transactions.length === 0) {
        recentTransactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No Transactions Yet</h3>
                <p>Add your first transaction to get started</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first) and take first 5
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    let transactionsHTML = '';
    
    recentTransactions.forEach(transaction => {
        const categoryInfo = categoryDetails[transaction.category] || categoryDetails.other;
        
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        transactionsHTML += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background-color: ${categoryInfo.color};">
                        <i class="${categoryInfo.icon}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${formattedDate} • ${categoryInfo.name}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    recentTransactionsList.innerHTML = transactionsHTML;
}

// Render all transactions
function renderAllTransactions() {
    if (transactions.length === 0) {
        allTransactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No Transactions Yet</h3>
                <p>Add your first transaction to get started</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let transactionsHTML = '';
    
    sortedTransactions.forEach(transaction => {
        const categoryInfo = categoryDetails[transaction.category] || categoryDetails.other;
        
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        transactionsHTML += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background-color: ${categoryInfo.color};">
                        <i class="${categoryInfo.icon}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${formattedDate} • ${categoryInfo.name}</p>
                    </div>
                </div>
                <div class="transaction-actions">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    allTransactionsList.innerHTML = transactionsHTML;
}

// Render budgets list
function renderBudgets() {
    if (budgets.length === 0) {
        budgetsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h3>No Budgets Set</h3>
                <p>Set budgets to track your spending</p>
            </div>
        `;
        return;
    }
    
    let budgetsHTML = '';
    
    budgets.forEach(budget => {
        const categoryInfo = categoryDetails[budget.category] || categoryDetails.other;
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = Math.min((spent / budget.amount) * 100, 100);
        const remaining = budget.amount - spent;
        
        budgetsHTML += `
            <div class="budget-item">
                <div class="budget-info">
                    <h4>${categoryInfo.name}</h4>
                    <p>Budget: ₹${budget.amount.toFixed(2)} | Spent: ₹${spent.toFixed(2)} | Remaining: ₹${remaining.toFixed(2)}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%; background-color: ${categoryInfo.color};"></div>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteBudget('${budget.category}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    budgetsList.innerHTML = budgetsHTML;
}

// Switch between tabs
function switchTab(tabName) {
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Close mobile menu if open
    document.querySelector('nav ul').classList.remove('show');
    
    // Refresh data for the tab
    if (tabName === 'transactions') {
        renderAllTransactions();
    } else if (tabName === 'budgets') {
        renderBudgets();
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}