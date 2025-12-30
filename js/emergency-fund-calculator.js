// Emergency Fund Calculator
// Calculates ideal emergency fund size based on expenses, income stability, and dependents

// DOM Elements
const calculateBtn = document.getElementById('calculateBtn');
const resultsSection = document.getElementById('resultsSection');
const noResults = document.getElementById('noResults');
const resultsContent = document.getElementById('resultsContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupRadioHighlighting();
});

function setupEventListeners() {
    calculateBtn.addEventListener('click', calculate);

    // Allow Enter key to trigger calculation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
}

function setupRadioHighlighting() {
    const radioGroups = document.querySelectorAll('.income-option');
    radioGroups.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');

        // Set initial state
        if (radio.checked) {
            option.classList.add('border-primary', 'bg-primary/5');
        }

        radio.addEventListener('change', () => {
            // Remove highlight from all options in group
            radioGroups.forEach(opt => {
                opt.classList.remove('border-primary', 'bg-primary/5');
            });
            // Add highlight to selected
            if (radio.checked) {
                option.classList.add('border-primary', 'bg-primary/5');
            }
        });
    });
}

function calculate() {
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value) || 0;
    const incomeStability = document.querySelector('input[name="incomeStability"]:checked').value;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;

    // Validate inputs
    if (monthlyExpenses <= 0) {
        alert('Please enter your monthly essential expenses.');
        return;
    }

    // Calculate recommended months based on factors
    const recommendedMonths = calculateRecommendedMonths(incomeStability, dependents);
    const targetAmount = monthlyExpenses * recommendedMonths;
    const amountNeeded = Math.max(0, targetAmount - currentSavings);

    // Calculate time to reach goal
    let timeToGoal = 0;
    if (monthlySavings > 0 && amountNeeded > 0) {
        timeToGoal = Math.ceil(amountNeeded / monthlySavings);
    }

    // Calculate progress
    const progressPercent = targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;

    // Display results
    displayResults({
        monthlyExpenses,
        monthlyIncome,
        currentSavings,
        monthlySavings,
        incomeStability,
        dependents,
        recommendedMonths,
        targetAmount,
        amountNeeded,
        timeToGoal,
        progressPercent
    });
}

function calculateRecommendedMonths(incomeStability, dependents) {
    // Base months based on income stability
    let baseMonths;
    switch (incomeStability) {
        case 'stable':
            baseMonths = 3;
            break;
        case 'variable':
            baseMonths = 6;
            break;
        case 'selfEmployed':
            baseMonths = 9;
            break;
        default:
            baseMonths = 6;
    }

    // Add months for dependents
    let dependentBonus;
    switch (dependents) {
        case 0:
            dependentBonus = 0;
            break;
        case 1:
            dependentBonus = 1;
            break;
        case 2:
            dependentBonus = 2;
            break;
        default: // 3+
            dependentBonus = 3;
    }

    return Math.min(12, baseMonths + dependentBonus);
}

function displayResults(data) {
    noResults.classList.add('hidden');
    resultsContent.classList.remove('hidden');

    // Update target amount
    document.getElementById('targetAmount').textContent = formatCurrency(data.targetAmount);
    document.getElementById('monthsCoverage').textContent = `${data.recommendedMonths} months of expenses`;

    // Update progress bar
    document.getElementById('progressPercent').textContent = `${Math.round(data.progressPercent)}%`;
    document.getElementById('progressBar').style.width = `${data.progressPercent}%`;
    document.getElementById('targetLabel').textContent = formatCurrency(data.targetAmount);

    // Update stats
    document.getElementById('amountNeeded').textContent = formatCurrency(data.amountNeeded);

    if (data.amountNeeded === 0) {
        document.getElementById('timeToGoal').textContent = 'Goal reached!';
    } else if (data.monthlySavings <= 0) {
        document.getElementById('timeToGoal').textContent = 'Set savings amount';
    } else {
        const years = Math.floor(data.timeToGoal / 12);
        const months = data.timeToGoal % 12;
        if (years > 0) {
            document.getElementById('timeToGoal').textContent = `${years}y ${months}m`;
        } else {
            document.getElementById('timeToGoal').textContent = `${data.timeToGoal} months`;
        }
    }

    // Update recommendation
    updateRecommendation(data);

    // Update milestones
    updateMilestones(data);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateRecommendation(data) {
    const box = document.getElementById('recommendationBox');
    const icon = document.getElementById('recommendationIcon');
    const title = document.getElementById('recommendationTitle');
    const text = document.getElementById('recommendationText');

    if (data.progressPercent >= 100) {
        // Goal reached
        box.className = 'p-4 rounded-lg mb-6 bg-green-50 border border-green-200';
        icon.className = 'w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-green-600';
        title.className = 'font-medium mb-1 text-green-800';
        title.textContent = 'Congratulations!';
        text.className = 'text-sm text-green-700';
        text.textContent = `You've reached your emergency fund goal! Consider keeping your savings in a high-yield account earning 4-5% APY. You may want to increase your target if your expenses rise.`;
    } else if (data.progressPercent >= 50) {
        // Good progress
        box.className = 'p-4 rounded-lg mb-6 bg-blue-50 border border-blue-200';
        icon.className = 'w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-blue-600';
        title.className = 'font-medium mb-1 text-blue-800';
        title.textContent = 'Great Progress!';
        text.className = 'text-sm text-blue-700';
        text.textContent = `You're more than halfway there! Stay consistent with your ${formatCurrency(data.monthlySavings)}/month savings. Consider automating transfers to stay on track.`;
    } else if (data.progressPercent > 0) {
        // Getting started
        box.className = 'p-4 rounded-lg mb-6 bg-yellow-50 border border-yellow-200';
        icon.className = 'w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-yellow-600';
        title.className = 'font-medium mb-1 text-yellow-800';
        title.textContent = 'Keep Building';
        text.className = 'text-sm text-yellow-700';

        if (data.monthlySavings > 0) {
            text.textContent = `You've made a good start! At ${formatCurrency(data.monthlySavings)}/month, you'll reach your goal in about ${formatTimeFrame(data.timeToGoal)}. Look for ways to boost your savings rate.`;
        } else {
            text.textContent = `You've made a good start! Enter your monthly savings amount above to see how long it will take to reach your goal.`;
        }
    } else {
        // Just starting
        box.className = 'p-4 rounded-lg mb-6 bg-gray-50 border border-gray-200';
        icon.className = 'w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-gray-600';
        title.className = 'font-medium mb-1 text-gray-800';
        title.textContent = 'Time to Start';
        text.className = 'text-sm text-gray-700';

        const startingTarget = Math.min(1000, data.monthlyExpenses);
        text.textContent = `Start with a mini-goal of ${formatCurrency(startingTarget)}. This covers small emergencies while you build toward your full fund. Automate even ${formatCurrency(50)}/week to get momentum.`;
    }
}

function updateMilestones(data) {
    const milestonesEl = document.getElementById('milestones');
    milestonesEl.innerHTML = '';

    const milestones = [
        { months: 1, label: '1 Month', description: 'Covers minor emergencies' },
        { months: 3, label: '3 Months', description: 'Basic safety net' },
        { months: 6, label: '6 Months', description: 'Standard recommendation' },
    ];

    // Add final target if different from standard milestones
    if (data.recommendedMonths > 6) {
        milestones.push({
            months: data.recommendedMonths,
            label: `${data.recommendedMonths} Months`,
            description: 'Your personalized goal'
        });
    }

    milestones.forEach(milestone => {
        const milestoneAmount = data.monthlyExpenses * milestone.months;
        const isReached = data.currentSavings >= milestoneAmount;
        const isTarget = milestone.months === data.recommendedMonths;

        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-3 rounded-lg ${isReached ? 'bg-green-50' : 'bg-gray-50'} ${isTarget ? 'ring-2 ring-primary' : ''}`;

        item.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isReached ? 'bg-green-500' : 'bg-gray-300'}">
                    ${isReached ? `
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ` : `
                        <span class="text-white text-sm font-medium">${milestone.months}</span>
                    `}
                </div>
                <div>
                    <div class="font-medium ${isReached ? 'text-green-800' : 'text-gray-900'}">${milestone.label}${isTarget ? ' (Your Goal)' : ''}</div>
                    <div class="text-sm ${isReached ? 'text-green-600' : 'text-gray-500'}">${milestone.description}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-medium ${isReached ? 'text-green-600' : 'text-gray-900'}">${formatCurrency(milestoneAmount)}</div>
                ${!isReached && data.monthlySavings > 0 ? `
                    <div class="text-sm text-gray-500">${formatTimeFrame(Math.ceil((milestoneAmount - data.currentSavings) / data.monthlySavings))}</div>
                ` : ''}
            </div>
        `;

        milestonesEl.appendChild(item);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatTimeFrame(months) {
    if (months <= 0) return 'Now';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
        return years === 1 ? '1 year' : `${years} years`;
    }

    return `${years}y ${remainingMonths}m`;
}
