function formatDate(dateStr) {
    if (dateStr == "N/A" || dateStr == "") {
        return '';
    }
    const parts = dateStr.split('/');
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
}

module.exports = {
    formatDate
};