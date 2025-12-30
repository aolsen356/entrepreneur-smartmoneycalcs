// Savings Goal Calculator
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const goalTypeButtons = document.querySelectorAll('.goal-type-btn');
    const calcModeButtons = document.querySelectorAll('.calc-mode-btn');
    const byDateInput = document.getElementById('byDateInput');
    const byAmountInput = document.getElementById('byAmountInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const noResults = document.getElementById('noResults');
    const resultsContent = document.getElementById('resultsContent');

    // Set default date to 1 year from now
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    document.getElementById('targetDate').value = defaultDate.toISOString().split('T')[0];

    // Goal type presets
    const goalPresets = {
        custom: { name: '', amount: 10000 },
        house: { name: 'House Down Payment', amount: 50000 },
        vacation: { name: 'Dream Vacation', amount: 5000 },
        car: { name: 'New Car Down Payment', amount: 8000 }
    };

    // Goal type selection
    goalTypeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            goalTypeButtons.forEach(b => {
                b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary');
                b.classList.add('border-gray-300', 'text-gray-600');
            });
            this.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary');
            this.classList.remove('border-gray-300', 'text-gray-600');

            const goalType = this.dataset.goal;
            const preset = goalPresets[goalType];
            if (preset) {
                document.getElementById('goalName').value = preset.name;
                document.getElementById('goalAmount').value = preset.amount;
            }
        });
    });

    // Calculation mode toggle
    calcModeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            calcModeButtons.forEach(b => {
                b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary');
                b.classList.add('border-gray-300', 'text-gray-600');
            });
            this.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary');
            this.classList.remove('border-gray-300', 'text-gray-600');

            if (this.id === 'byDateBtn') {
                byDateInput.classList.remove('hidden');
                byAmountInput.classList.add('hidden');
            } else {
                byDateInput.classList.add('hidden');
                byAmountInput.classList.remove('hidden');
            }
        });
    });

    // Calculate button
    calculateBtn.addEventListener('click', calculateSavings);

    function calculateSavings() {
        const goalName = document.getElementById('goalName').value || 'Your Goal';
        const goalAmount = parseFloat(document.getElementById('goalAmount').value) || 0;
        const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
        const isDateMode = !byDateInput.classList.contains('hidden');

        const amountNeeded = goalAmount - currentSavings;

        if (amountNeeded <= 0) {
            showAlreadyReached(goalName, goalAmount, currentSavings);
            return;
        }

        let monthlyAmount, totalMonths, targetDate;

        if (isDateMode) {
            // Calculate monthly amount based on target date
            const targetDateStr = document.getElementById('targetDate').value;
            if (!targetDateStr) {
                alert('Please select a target date');
                return;
            }
            targetDate = new Date(targetDateStr);
            const today = new Date();
            totalMonths = Math.max(1, monthsDiff(today, targetDate));
            monthlyAmount = calculateMonthlyPayment(amountNeeded, interestRate, totalMonths);
        } else {
            // Calculate date based on monthly amount
            monthlyAmount = parseFloat(document.getElementById('monthlySavings').value) || 0;
            if (monthlyAmount <= 0) {
                alert('Please enter a monthly savings amount');
                return;
            }
            totalMonths = calculateMonthsToGoal(amountNeeded, interestRate, monthlyAmount);
            targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + totalMonths);
        }

        // Calculate totals with compound interest
        const totals = calculateWithInterest(currentSavings, monthlyAmount, interestRate, totalMonths);

        displayResults({
            goalName,
            goalAmount,
            currentSavings,
            monthlyAmount,
            totalMonths,
            targetDate,
            totalContributions: totals.contributions,
            interestEarned: totals.interest,
            finalBalance: totals.balance
        });
    }

    function monthsDiff(date1, date2) {
        return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
    }

    function calculateMonthlyPayment(principal, annualRate, months) {
        if (annualRate === 0) {
            return principal / months;
        }
        const monthlyRate = annualRate / 12;
        // Future value of annuity formula solved for payment
        // FV = P * ((1 + r)^n - 1) / r
        // P = FV * r / ((1 + r)^n - 1)
        const payment = principal * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
        return payment;
    }

    function calculateMonthsToGoal(principal, annualRate, monthlyPayment) {
        if (annualRate === 0) {
            return Math.ceil(principal / monthlyPayment);
        }
        const monthlyRate = annualRate / 12;
        // Solve for n: FV = P * ((1 + r)^n - 1) / r
        // n = ln(FV * r / P + 1) / ln(1 + r)
        const months = Math.log(principal * monthlyRate / monthlyPayment + 1) / Math.log(1 + monthlyRate);
        return Math.ceil(months);
    }

    function calculateWithInterest(startingBalance, monthlyPayment, annualRate, months) {
        const monthlyRate = annualRate / 12;
        let balance = startingBalance;
        let totalContributions = 0;

        for (let i = 0; i < months; i++) {
            balance = balance * (1 + monthlyRate) + monthlyPayment;
            totalContributions += monthlyPayment;
        }

        const interestEarned = balance - startingBalance - totalContributions;

        return {
            balance,
            contributions: totalContributions,
            interest: interestEarned
        };
    }

    function displayResults(data) {
        noResults.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // Goal summary
        document.getElementById('goalSummary').textContent =
            `${data.goalName}: ${formatCurrency(data.goalAmount)}`;

        // Main results
        document.getElementById('monthlyAmount').textContent = formatCurrency(data.monthlyAmount);
        document.getElementById('targetDateResult').textContent = formatDate(data.targetDate);
        document.getElementById('totalContributions').textContent = formatCurrency(data.totalContributions);
        document.getElementById('interestEarned').textContent = '+' + formatCurrency(data.interestEarned);
        document.getElementById('totalMonths').textContent = data.totalMonths;

        // Milestones
        displayMilestones(data);

        // Tips
        displayTips(data);
    }

    function displayMilestones(data) {
        const container = document.getElementById('milestones');
        container.innerHTML = '';

        const milestones = [
            { percent: 25, label: '25% Complete' },
            { percent: 50, label: '50% Halfway There!' },
            { percent: 75, label: '75% Almost Done!' },
            { percent: 100, label: '100% Goal Reached!' }
        ];

        const amountNeeded = data.goalAmount - data.currentSavings;

        milestones.forEach((milestone, index) => {
            const monthsToMilestone = Math.ceil(data.totalMonths * (milestone.percent / 100));
            const milestoneDate = new Date();
            milestoneDate.setMonth(milestoneDate.getMonth() + monthsToMilestone);
            const milestoneAmount = data.currentSavings + (amountNeeded * (milestone.percent / 100));

            const div = document.createElement('div');
            div.className = 'flex items-center gap-4';
            div.style.animationDelay = `${index * 0.1}s`;

            const color = milestone.percent === 100 ? 'bg-primary' : 'bg-gray-300';
            const textColor = milestone.percent === 100 ? 'text-primary' : 'text-gray-600';

            div.innerHTML = `
                <div class="w-3 h-3 ${color} rounded-full flex-shrink-0"></div>
                <div class="flex-grow">
                    <div class="font-medium ${textColor}">${milestone.label}</div>
                    <div class="text-sm text-gray-500">${formatCurrency(milestoneAmount)} by ${formatDate(milestoneDate)}</div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function displayTips(data) {
        const tipsList = document.getElementById('tipsList');
        tipsList.innerHTML = '';

        const goalName = document.getElementById('goalName').value.toLowerCase();
        let tips = [];

        // Generic tips
        tips.push('Set up automatic transfers on payday to ensure consistent savings');
        tips.push('Keep this money in a high-yield savings account earning 4-5% APY');

        // Goal-specific tips
        if (goalName.includes('house') || goalName.includes('home') || goalName.includes('down payment')) {
            tips.push('Look into first-time homebuyer programs for down payment assistance');
            tips.push('Check if your state offers tax benefits for home savings accounts');
        } else if (goalName.includes('vacation') || goalName.includes('travel') || goalName.includes('trip')) {
            tips.push('Book flights and hotels early for better rates');
            tips.push('Consider travel rewards credit cards to stretch your budget');
        } else if (goalName.includes('car')) {
            tips.push('A larger down payment means lower monthly payments and less interest');
            tips.push('Consider certified pre-owned to get more value');
        } else if (goalName.includes('emergency')) {
            tips.push('Keep emergency funds liquid and easily accessible');
            tips.push('Start with $1,000, then build to 3-6 months of expenses');
        }

        // Add tips to list
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = '• ' + tip;
            tipsList.appendChild(li);
        });
    }

    function showAlreadyReached(goalName, goalAmount, currentSavings) {
        noResults.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        resultsContent.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">Congratulations!</h3>
                <p class="text-gray-600 mb-4">You've already reached your goal of ${formatCurrency(goalAmount)}!</p>
                <p class="text-gray-500">Current savings: ${formatCurrency(currentSavings)}</p>
                <p class="text-gray-500">Surplus: ${formatCurrency(currentSavings - goalAmount)}</p>
            </div>
        `;
    }

    function formatCurrency(amount) {
        return '$' + Math.round(amount).toLocaleString();
    }

    function formatDate(date) {
        const options = { month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
});
