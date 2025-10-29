// Custom text variables
const acfData = {
    "apyvalue": "2.93%",
    "apytier1": "1.69%",
    "apytier2": "2.39%",
    "apytier3": "2.71%",
    "apymultiple": "60x",
    "nationalapy": "0.07%",
    "cashback_uppercase": "Unlimited 1%",
    "cashback_lowercase": "unlimited 1%",
    "cashback": "1%",
    "cashback_up_to": "1%",
    "apy_effective_date": "11/16/2023",
    "all_rewards_above": "1%",
    "maximum_annual_spend_per_calendar_year": "$2,000",
    "banking_disclosure": "Baselane is a financial technology company and is not a bank. Banking services provided by Thread Bank, Member FDIC. FDIC insurance available for funds on deposit through Thread Bank, Member FDIC. Pass-through insurance coverage is subject to conditions.<sup>1</sup>",
    "fdic_short": "$3M",
    "fdic_long": "$3,000,000",
    "fdic_insurance_up": "$250,000",
};

// Update the dynamic values
function updateDynamicValues() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;

    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        let content = textNode.textContent;
        let hasChanges = false;
        
        // Pattern for [v="key"]value[/v] format
        const fullPattern = /\[v="([^"]+)"\][^\[]*\[\/v\]/g;
        content = content.replace(fullPattern, (match, key) => {
            hasChanges = true;
            return acfData[key] || match;
        });
        
        // Pattern for [v="key"] format
        const shortPattern = /\[v="([^"]+)"\]/g;
        content = content.replace(shortPattern, (match, key) => {
            hasChanges = true;
            return acfData[key] || match;
        });

        if (hasChanges) {
            textNode.textContent = content;
        }
    });
}

document.addEventListener('DOMContentLoaded', updateDynamicValues);
