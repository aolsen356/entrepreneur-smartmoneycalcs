// Freelancer Budget Calculator
// Helps freelancers manage irregular income with tax, savings, and expense allocation

document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time updates
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(calculateBudget, 300));
    });

    // Initial calculation
    calculateBudget();
});

// Debounce function to prevent excessive calculations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Set tax rate from preset buttons
function setTaxRate(rate) {
    document.getElementById('taxRate').value = rate;
    calculateBudget();
}

// Main calculation function
function calculateBudget() {
    // Get input values
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const averageIncome = parseFloat(document.getElementById('averageIncome').value) || monthlyIncome;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 30;

    // Fixed expenses
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const subscriptions = parseFloat(document.getElementById('subscriptions').value) || 0;
    const otherFixed = parseFloat(document.getElementById('otherFixed').value) || 0;

    // Savings percentages
    const emergencyPercent = parseFloat(document.getElementById('emergencyPercent').value) || 0;
    const retirementPercent = parseFloat(document.getElementById('retirementPercent').value) || 0;

    // Calculate amounts
    const taxAmount = monthlyIncome * (taxRate / 100);
    const totalFixed = rent + utilities + insurance + subscriptions + otherFixed;
    const afterTaxAndFixed = monthlyIncome - taxAmount - totalFixed;

    // Savings from remaining amount
    const emergencyAmount = Math.max(0, afterTaxAndFixed * (emergencyPercent / 100));
    const retirementAmount = Math.max(0, afterTaxAndFixed * (retirementPercent / 100));
    const totalSavings = emergencyAmount + retirementAmount;

    // Flexible spending (what's left)
    const remainingAmount = Math.max(0, afterTaxAndFixed - totalSavings);

    // Calculate percentages for visual bars
    const taxPercent = monthlyIncome > 0 ? (taxAmount / monthlyIncome) * 100 : 0;
    const fixedPercent = monthlyIncome > 0 ? (totalFixed / monthlyIncome) * 100 : 0;
    const emergencyVisualPercent = monthlyIncome > 0 ? (emergencyAmount / monthlyIncome) * 100 : 0;
    const retirementVisualPercent = monthlyIncome > 0 ? (retirementAmount / monthlyIncome) * 100 : 0;
    const flexiblePercent = monthlyIncome > 0 ? (remainingAmount / monthlyIncome) * 100 : 0;

    // Update display
    document.getElementById('displayIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('taxPercent').textContent = `${taxRate}%`;
    document.getElementById('fixedAmount').textContent = formatCurrency(totalFixed);
    document.getElementById('emergencyAmount').textContent = formatCurrency(emergencyAmount);
    document.getElementById('emergencyPercentDisplay').textContent = `${emergencyPercent}% of remaining`;
    document.getElementById('retirementAmount').textContent = formatCurrency(retirementAmount);
    document.getElementById('retirementPercentDisplay').textContent = `${retirementPercent}% of remaining`;
    document.getElementById('remainingAmount').textContent = formatCurrency(remainingAmount);

    // Update visual bars
    document.getElementById('taxBar').style.width = `${taxPercent}%`;
    document.getElementById('fixedBar').style.width = `${fixedPercent}%`;
    document.getElementById('emergencyBar').style.width = `${emergencyVisualPercent}%`;
    document.getElementById('retirementBar').style.width = `${retirementVisualPercent}%`;
    document.getElementById('flexibleBar').style.width = `${flexiblePercent}%`;

    // Show/hide results
    document.getElementById('noResults').classList.add('hidden');
    document.getElementById('resultsContent').classList.remove('hidden');

    // Generate insights
    generateInsights(monthlyIncome, averageIncome, taxRate, totalFixed, afterTaxAndFixed, emergencyAmount, retirementAmount, remainingAmount);

    // Show good/lean month alerts
    handleMonthAlerts(monthlyIncome, averageIncome);
}

// Format currency with commas
function formatCurrency(amount) {
    return '$' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Generate insights based on the calculations
function generateInsights(income, avgIncome, taxRate, fixed, afterTaxFixed, emergency, retirement, flexible) {
    const insights = [];
    const insightsBox = document.getElementById('insightsBox');
    const insightsList = document.getElementById('insightsList');

    // Check if fixed expenses are too high
    const fixedRatio = income > 0 ? (fixed / income) * 100 : 0;
    if (fixedRatio > 50) {
        insights.push({
            type: 'warning',
            message: `Your fixed expenses are ${fixedRatio.toFixed(0)}% of income. Consider reducing costs if possible.`
        });
    }

    // Check if there's negative cashflow
    if (afterTaxFixed < 0) {
        insights.push({
            type: 'critical',
            message: `Your expenses exceed your after-tax income by ${formatCurrency(Math.abs(afterTaxFixed))}. Urgent action needed.`
        });
    }

    // Check savings rate
    const totalSavingsRate = income > 0 ? ((emergency + retirement) / income) * 100 : 0;
    if (totalSavingsRate < 10 && afterTaxFixed > 0) {
        insights.push({
            type: 'warning',
            message: 'Your savings rate is low. Try to save at least 15-20% of income for emergencies and retirement.'
        });
    } else if (totalSavingsRate >= 20) {
        insights.push({
            type: 'success',
            message: `Great job! You're saving ${totalSavingsRate.toFixed(0)}% of your income.`
        });
    }

    // Tax rate check
    if (taxRate < 25 && income > 3000) {
        insights.push({
            type: 'info',
            message: 'Your tax rate may be low. Most freelancers should set aside 25-35% for taxes.'
        });
    }

    // Quarterly tax reminder
    const quarterlyTax = (income * (taxRate / 100)) * 3;
    if (income > 0) {
        insights.push({
            type: 'info',
            message: `Based on this month, your quarterly estimated tax payment would be ~${formatCurrency(quarterlyTax)}.`
        });
    }

    // Display insights
    if (insights.length > 0) {
        insightsBox.classList.remove('hidden');
        insightsList.innerHTML = insights.map(insight => {
            let colorClass = 'text-gray-600';
            let bgClass = 'bg-gray-50';
            let icon = '';

            if (insight.type === 'warning') {
                colorClass = 'text-amber-700';
                bgClass = 'bg-amber-50';
                icon = '<svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            } else if (insight.type === 'critical') {
                colorClass = 'text-red-700';
                bgClass = 'bg-red-50';
                icon = '<svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
            } else if (insight.type === 'success') {
                colorClass = 'text-green-700';
                bgClass = 'bg-green-50';
                icon = '<svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            } else {
                icon = '<svg class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
                bgClass = 'bg-blue-50';
                colorClass = 'text-blue-700';
            }

            return `<div class="flex items-start p-3 ${bgClass} rounded-lg ${colorClass}">
                ${icon}
                <span>${insight.message}</span>
            </div>`;
        }).join('');
    } else {
        insightsBox.classList.add('hidden');
    }
}

// Handle good/lean month alerts
function handleMonthAlerts(currentIncome, averageIncome) {
    const goodMonthAlert = document.getElementById('goodMonthAlert');
    const leanMonthAlert = document.getElementById('leanMonthAlert');
    const goodMonthMessage = document.getElementById('goodMonthMessage');
    const leanMonthMessage = document.getElementById('leanMonthMessage');

    // Hide both by default
    goodMonthAlert.classList.add('hidden');
    leanMonthAlert.classList.add('hidden');

    if (averageIncome > 0) {
        const difference = currentIncome - averageIncome;
        const percentDiff = (difference / averageIncome) * 100;

        if (percentDiff >= 15) {
            // Good month (15%+ above average)
            goodMonthAlert.classList.remove('hidden');
            goodMonthMessage.textContent = `Your income is ${formatCurrency(difference)} (${percentDiff.toFixed(0)}%) above your average. Consider putting the extra into savings or paying down debt!`;
        } else if (percentDiff <= -15) {
            // Lean month (15%+ below average)
            leanMonthAlert.classList.remove('hidden');
            leanMonthMessage.textContent = `Your income is ${formatCurrency(Math.abs(difference))} (${Math.abs(percentDiff).toFixed(0)}%) below your average. Consider reducing flexible spending and dipping into emergency fund if needed.`;
        }
    }
}
