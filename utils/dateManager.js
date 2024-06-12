function formatDate(dateStr) {
    if (typeof dateStr !== 'string') {
        if (dateStr instanceof Date) {
            // Convert Date object to string in MM/DD/YYYY format
            dateStr = dateStr.toLocaleDateString('en-US');
        } else {
            throw new TypeError('Expected a string or Date object as input');
        }
    }
    if (dateStr == "N/A" || dateStr == "") {
        return '';
    }
    const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    throw new Error(`Invalid date format: ${dateStr}`);
}

module.exports = {
    formatDate
};