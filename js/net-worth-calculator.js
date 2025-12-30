// Net Worth Calculator
// SmartMoney Calcs - Track your financial health

document.addEventListener('DOMContentLoaded', function() {
    // Get all input elements
    const assetInputs = document.querySelectorAll('.asset-input');
    const liabilityInputs = document.querySelectorAll('.liability-input');

    // Add event listeners to all inputs
    assetInputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    liabilityInputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initialize
    calculate();
});

function calculate() {
    // Calculate total assets by category
    const cashTypes = ['checking', 'savings', 'emergency', 'cash'];
    const investmentTypes = ['401k', 'ira', 'brokerage', 'crypto'];
    const propertyTypes = ['home', 'realestate', 'vehicles'];
    const otherAssetTypes = ['business', 'other'];

    let cashTotal = 0;
    let investmentsTotal = 0;
    let propertyTotal = 0;
    let otherAssetsTotal = 0;

    // Sum cash & savings
    cashTypes.forEach(type => {
        const input = document.querySelector(`[data-type="${type}"]`);
        if (input) {
            cashTotal += parseFloat(input.value) || 0;
        }
    });

    // Sum investments
    investmentTypes.forEach(type => {
        const input = document.querySelector(`[data-type="${type}"]`);
        if (input) {
            investmentsTotal += parseFloat(input.value) || 0;
        }
    });

    // Sum property
    propertyTypes.forEach(type => {
        const input = document.querySelector(`[data-type="${type}"]`);
        if (input) {
            propertyTotal += parseFloat(input.value) || 0;
        }
    });

    // Sum other assets
    otherAssetTypes.forEach(type => {
        const input = document.querySelector(`[data-type="${type}"]`);
        if (input) {
            otherAssetsTotal += parseFloat(input.value) || 0;
        }
    });

    const totalAssets = cashTotal + investmentsTotal + propertyTotal + otherAssetsTotal;

    // Calculate total liabilities
    let totalLiabilities = 0;
    document.querySelectorAll('.liability-input').forEach(input => {
        totalLiabilities += parseFloat(input.value) || 0;
    });

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;

    // Update displays
    updateDisplays(totalAssets, totalLiabilities, netWorth, cashTotal, investmentsTotal, propertyTotal, otherAssetsTotal);

    // Generate health tips
    generateHealthTips(totalAssets, totalLiabilities, netWorth, cashTotal, investmentsTotal);
}

function updateDisplays(totalAssets, totalLiabilities, netWorth, cashTotal, investmentsTotal, propertyTotal, otherAssetsTotal) {
    // Format currency
    const formatCurrency = (value) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return (value < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(2) + 'M';
        } else if (absValue >= 1000) {
            return (value < 0 ? '-' : '') + '$' + (absValue / 1000).toFixed(1) + 'K';
        }
        return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    };

    const formatFullCurrency = (value) => {
        return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    };

    // Update totals in asset/liability sections
    document.getElementById('totalAssetsDisplay').textContent = formatFullCurrency(totalAssets);
    document.getElementById('totalLiabilitiesDisplay').textContent = formatFullCurrency(totalLiabilities);

    // Update main net worth display
    const netWorthDisplay = document.getElementById('netWorthDisplay');
    const netWorthBox = document.getElementById('netWorthBox');
    const netWorthLabel = document.getElementById('netWorthLabel');

    if (netWorth >= 0) {
        netWorthDisplay.textContent = formatFullCurrency(netWorth);
        netWorthDisplay.className = 'text-5xl font-bold mb-2 text-green-600';
        netWorthBox.className = 'text-center py-8 border-2 border-green-200 bg-green-50 rounded-xl mb-6';
        netWorthLabel.textContent = netWorth > 0 ? 'Positive Net Worth' : 'Break Even';
    } else {
        netWorthDisplay.textContent = '-' + formatFullCurrency(Math.abs(netWorth));
        netWorthDisplay.className = 'text-5xl font-bold mb-2 text-red-600';
        netWorthBox.className = 'text-center py-8 border-2 border-red-200 bg-red-50 rounded-xl mb-6';
        netWorthLabel.textContent = 'Negative Net Worth';
    }

    // Update summary cards
    document.getElementById('summaryAssets').textContent = formatFullCurrency(totalAssets);
    document.getElementById('summaryLiabilities').textContent = formatFullCurrency(totalLiabilities);

    // Update visual bar
    const total = totalAssets + totalLiabilities;
    if (total > 0) {
        const assetsPercent = (totalAssets / total * 100).toFixed(0);
        const liabilitiesPercent = (totalLiabilities / total * 100).toFixed(0);

        document.getElementById('assetsBar').style.width = assetsPercent + '%';
        document.getElementById('liabilitiesBar').style.width = liabilitiesPercent + '%';
        document.getElementById('assetsPercent').textContent = assetsPercent + '%';
        document.getElementById('liabilitiesPercent').textContent = liabilitiesPercent + '%';
    } else {
        document.getElementById('assetsBar').style.width = '50%';
        document.getElementById('liabilitiesBar').style.width = '50%';
        document.getElementById('assetsPercent').textContent = '0%';
        document.getElementById('liabilitiesPercent').textContent = '0%';
    }

    // Update debt-to-asset ratio
    const debtRatioEl = document.getElementById('debtRatio');
    const debtRatioAdviceEl = document.getElementById('debtRatioAdvice');

    if (totalAssets > 0) {
        const debtRatio = (totalLiabilities / totalAssets * 100).toFixed(1);
        debtRatioEl.textContent = debtRatio + '%';

        if (debtRatio <= 30) {
            debtRatioEl.className = 'text-xl font-bold text-green-600';
            debtRatioAdviceEl.textContent = 'Excellent! Your debt is well under control.';
        } else if (debtRatio <= 50) {
            debtRatioEl.className = 'text-xl font-bold text-yellow-600';
            debtRatioAdviceEl.textContent = 'Good. Aim to reduce this below 30% for more financial flexibility.';
        } else if (debtRatio <= 80) {
            debtRatioEl.className = 'text-xl font-bold text-orange-600';
            debtRatioAdviceEl.textContent = 'Consider focusing on debt reduction to improve financial security.';
        } else {
            debtRatioEl.className = 'text-xl font-bold text-red-600';
            debtRatioAdviceEl.textContent = 'High leverage. Prioritize paying down debt before taking on more.';
        }
    } else {
        debtRatioEl.textContent = totalLiabilities > 0 ? '100%+' : '0%';
        debtRatioEl.className = totalLiabilities > 0 ? 'text-xl font-bold text-red-600' : 'text-xl font-bold text-gray-600';
        debtRatioAdviceEl.textContent = totalLiabilities > 0
            ? 'You have debt but no recorded assets. Focus on building assets.'
            : 'Enter your assets and liabilities to see your ratio.';
    }

    // Update asset breakdown
    document.getElementById('cashTotal').textContent = formatFullCurrency(cashTotal);
    document.getElementById('investmentsTotal').textContent = formatFullCurrency(investmentsTotal);
    document.getElementById('propertyTotal').textContent = formatFullCurrency(propertyTotal);
    document.getElementById('otherAssetsTotal').textContent = formatFullCurrency(otherAssetsTotal);
}

function generateHealthTips(totalAssets, totalLiabilities, netWorth, cashTotal, investmentsTotal) {
    const tipsContainer = document.getElementById('healthTips');
    const tips = [];

    // Check if any data entered
    if (totalAssets === 0 && totalLiabilities === 0) {
        tipsContainer.innerHTML = `
            <div class="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                Enter your financial information to get personalized insights.
            </div>
        `;
        return;
    }

    // Tip: Negative net worth
    if (netWorth < 0) {
        tips.push({
            type: 'warning',
            text: 'Your liabilities exceed your assets. Focus on paying down high-interest debt while building savings.'
        });
    }

    // Tip: High debt ratio
    if (totalAssets > 0) {
        const debtRatio = totalLiabilities / totalAssets;
        if (debtRatio > 0.8) {
            tips.push({
                type: 'warning',
                text: 'Your debt-to-asset ratio is high (>80%). Consider pausing new debt and focusing on repayment.'
            });
        } else if (debtRatio > 0.5) {
            tips.push({
                type: 'info',
                text: 'Your debt-to-asset ratio is moderate. Try to reduce it below 50% for better financial flexibility.'
            });
        }
    }

    // Tip: Low cash reserves
    if (cashTotal < 1000 && totalAssets > 0) {
        tips.push({
            type: 'warning',
            text: 'Your cash reserves are low. Build an emergency fund of 3-6 months of expenses.'
        });
    } else if (cashTotal >= 1000 && cashTotal < 5000) {
        tips.push({
            type: 'info',
            text: 'Good start on cash savings! Aim for 3-6 months of expenses in your emergency fund.'
        });
    }

    // Tip: No investments
    if (investmentsTotal === 0 && netWorth > 0) {
        tips.push({
            type: 'info',
            text: 'Consider investing for long-term growth. Retirement accounts like 401(k) and IRA offer tax advantages.'
        });
    }

    // Tip: Good standing
    if (netWorth > 0 && totalLiabilities / (totalAssets || 1) < 0.3) {
        tips.push({
            type: 'success',
            text: 'Your finances are in good shape! Keep building assets and consider increasing investments.'
        });
    }

    // Tip: All investments, low cash
    if (investmentsTotal > 0 && cashTotal < investmentsTotal * 0.1) {
        tips.push({
            type: 'info',
            text: 'Ensure you have adequate liquid savings before investing more. Aim for 3-6 months expenses in cash.'
        });
    }

    // Credit card debt warning
    const creditCardDebt = parseFloat(document.querySelector('[data-type="creditcard"]')?.value) || 0;
    if (creditCardDebt > 5000) {
        tips.push({
            type: 'warning',
            text: 'Credit card debt is expensive (15-25% APR). Prioritize paying this off before other debts.'
        });
    }

    // Render tips
    if (tips.length === 0) {
        tips.push({
            type: 'success',
            text: 'Keep tracking your net worth regularly to stay on top of your financial health!'
        });
    }

    tipsContainer.innerHTML = tips.map(tip => {
        let bgColor, textColor, icon;
        switch(tip.type) {
            case 'warning':
                bgColor = 'bg-yellow-50';
                textColor = 'text-yellow-800';
                icon = `<svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>`;
                break;
            case 'success':
                bgColor = 'bg-green-50';
                textColor = 'text-green-800';
                icon = `<svg class="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>`;
                break;
            default:
                bgColor = 'bg-blue-50';
                textColor = 'text-blue-800';
                icon = `<svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>`;
        }

        return `
            <div class="p-3 ${bgColor} rounded-lg text-sm ${textColor} flex items-start">
                ${icon}
                <span>${tip.text}</span>
            </div>
        `;
    }).join('');
}
