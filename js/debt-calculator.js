// Debt Payoff Calculator
// Supports both Avalanche (highest interest first) and Snowball (lowest balance first) methods

let debts = [];
let debtIdCounter = 0;
let strategy = 'avalanche';

// DOM Elements
const debtList = document.getElementById('debtList');
const addDebtBtn = document.getElementById('addDebtBtn');
const calculateBtn = document.getElementById('calculateBtn');
const avalancheBtn = document.getElementById('avalancheBtn');
const snowballBtn = document.getElementById('snowballBtn');
const resultsSection = document.getElementById('resultsSection');
const noResults = document.getElementById('noResults');
const resultsContent = document.getElementById('resultsContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addDebt(); // Start with one debt entry
    setupEventListeners();
});

function setupEventListeners() {
    addDebtBtn.addEventListener('click', addDebt);
    calculateBtn.addEventListener('click', calculate);

    avalancheBtn.addEventListener('click', () => setStrategy('avalanche'));
    snowballBtn.addEventListener('click', () => setStrategy('snowball'));
}

function setStrategy(newStrategy) {
    strategy = newStrategy;

    // Update button styles
    avalancheBtn.classList.toggle('border-primary', strategy === 'avalanche');
    avalancheBtn.classList.toggle('bg-primary/5', strategy === 'avalanche');
    avalancheBtn.classList.toggle('text-primary', strategy === 'avalanche');
    avalancheBtn.classList.toggle('border-gray-300', strategy !== 'avalanche');
    avalancheBtn.classList.toggle('text-gray-600', strategy !== 'avalanche');

    snowballBtn.classList.toggle('border-primary', strategy === 'snowball');
    snowballBtn.classList.toggle('bg-primary/5', strategy === 'snowball');
    snowballBtn.classList.toggle('text-primary', strategy === 'snowball');
    snowballBtn.classList.toggle('border-gray-300', strategy !== 'snowball');
    snowballBtn.classList.toggle('text-gray-600', strategy !== 'snowball');
}

function addDebt() {
    const id = debtIdCounter++;

    const debtEntry = document.createElement('div');
    debtEntry.className = 'debt-entry bg-gray-50 p-4 rounded-lg';
    debtEntry.id = `debt-${id}`;

    debtEntry.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <input type="text" placeholder="Debt name (e.g., Chase Visa)"
                class="debt-name font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 w-full"
                value="Debt ${id + 1}">
            <button class="remove-debt text-gray-400 hover:text-red-500 ml-2" data-id="${id}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <div class="grid grid-cols-3 gap-3">
            <div>
                <label class="block text-xs text-gray-500 mb-1">Balance</label>
                <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" class="debt-balance w-full pl-6 pr-2 py-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="5000" min="0" step="100">
                </div>
            </div>
            <div>
                <label class="block text-xs text-gray-500 mb-1">APR %</label>
                <div class="relative">
                    <input type="number" class="debt-apr w-full pl-2 pr-6 py-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="19.99" min="0" max="99" step="0.01">
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
            </div>
            <div>
                <label class="block text-xs text-gray-500 mb-1">Min Payment</label>
                <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" class="debt-minpay w-full pl-6 pr-2 py-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="150" min="0" step="10">
                </div>
            </div>
        </div>
    `;

    debtList.appendChild(debtEntry);

    // Add remove listener
    debtEntry.querySelector('.remove-debt').addEventListener('click', () => removeDebt(id));
}

function removeDebt(id) {
    const entry = document.getElementById(`debt-${id}`);
    if (entry && debtList.children.length > 1) {
        entry.remove();
    }
}

function getDebtsFromForm() {
    const entries = document.querySelectorAll('.debt-entry');
    const debts = [];

    entries.forEach(entry => {
        const name = entry.querySelector('.debt-name').value || 'Unnamed Debt';
        const balance = parseFloat(entry.querySelector('.debt-balance').value) || 0;
        const apr = parseFloat(entry.querySelector('.debt-apr').value) || 0;
        const minPayment = parseFloat(entry.querySelector('.debt-minpay').value) || 0;

        if (balance > 0 && minPayment > 0) {
            debts.push({
                name,
                balance,
                apr,
                minPayment,
                originalBalance: balance
            });
        }
    });

    return debts;
}

function calculate() {
    const debts = getDebtsFromForm();
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;

    if (debts.length === 0) {
        alert('Please add at least one debt with a balance and minimum payment.');
        return;
    }

    // Calculate payoff with current strategy
    const result = calculatePayoff(debts, extraPayment, strategy);

    // Calculate baseline (no extra payment) for comparison
    const baseline = calculatePayoff(debts, 0, strategy);

    displayResults(result, baseline, extraPayment);
}

function calculatePayoff(debtsInput, extraPayment, method) {
    // Deep copy debts
    let debts = debtsInput.map(d => ({...d}));

    // Sort based on strategy
    if (method === 'avalanche') {
        debts.sort((a, b) => b.apr - a.apr); // Highest APR first
    } else {
        debts.sort((a, b) => a.balance - b.balance); // Lowest balance first
    }

    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    const payoffOrder = [];

    const maxMonths = 600; // 50 years max to prevent infinite loops

    while (debts.some(d => d.balance > 0) && months < maxMonths) {
        months++;

        let availableExtra = extraPayment;

        // Process each debt
        for (let i = 0; i < debts.length; i++) {
            const debt = debts[i];
            if (debt.balance <= 0) continue;

            // Calculate monthly interest
            const monthlyRate = debt.apr / 100 / 12;
            const interest = debt.balance * monthlyRate;
            totalInterest += interest;

            // Add interest to balance
            debt.balance += interest;

            // Apply minimum payment
            let payment = Math.min(debt.minPayment, debt.balance);
            debt.balance -= payment;
            totalPaid += payment;

            // Apply extra payment to first unpaid debt (based on strategy order)
            if (i === debts.findIndex(d => d.balance > 0) && availableExtra > 0) {
                const extraApplied = Math.min(availableExtra, debt.balance);
                debt.balance -= extraApplied;
                totalPaid += extraApplied;
                availableExtra -= extraApplied;
            }

            // Check if paid off
            if (debt.balance <= 0.01 && !debt.paidOff) {
                debt.balance = 0;
                debt.paidOff = true;
                debt.paidOffMonth = months;
                payoffOrder.push({
                    name: debt.name,
                    month: months,
                    originalBalance: debt.originalBalance
                });

                // Freed minimum payment becomes extra for next debt
                availableExtra += debt.minPayment;
            }
        }
    }

    return {
        months,
        totalInterest,
        totalPaid,
        payoffOrder,
        debts
    };
}

function displayResults(result, baseline, extraPayment) {
    noResults.classList.add('hidden');
    resultsContent.classList.remove('hidden');

    // Calculate payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + result.months);
    const dateOptions = { year: 'numeric', month: 'short' };

    // Update summary cards
    document.getElementById('payoffDate').textContent = payoffDate.toLocaleDateString('en-US', dateOptions);
    document.getElementById('totalInterest').textContent = formatCurrency(result.totalInterest);
    document.getElementById('totalPayments').textContent = formatCurrency(result.totalPaid);
    document.getElementById('monthsToPayoff').textContent = result.months;

    // Show savings if extra payment applied
    const savingsBox = document.getElementById('savingsBox');
    if (extraPayment > 0) {
        const interestSaved = baseline.totalInterest - result.totalInterest;
        const monthsSaved = baseline.months - result.months;

        if (interestSaved > 0) {
            document.getElementById('interestSaved').textContent = formatCurrency(interestSaved);
            savingsBox.classList.remove('hidden');
        } else {
            savingsBox.classList.add('hidden');
        }
    } else {
        savingsBox.classList.add('hidden');
    }

    // Display payoff order
    const scheduleEl = document.getElementById('payoffSchedule');
    scheduleEl.innerHTML = '';

    result.payoffOrder.forEach((debt, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + debt.month);

        item.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span class="text-sm font-semibold text-primary">${index + 1}</span>
                </div>
                <div>
                    <div class="font-medium">${escapeHtml(debt.name)}</div>
                    <div class="text-sm text-gray-500">${formatCurrency(debt.originalBalance)}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-medium text-primary">${payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                <div class="text-sm text-gray-500">${debt.month} months</div>
            </div>
        `;

        scheduleEl.appendChild(item);
    });

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
