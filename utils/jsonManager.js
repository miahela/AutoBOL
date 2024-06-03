const fs = require('fs');

function writeToJsonFile(data, filePath) {
    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Data written to JSON file successfully.');
        }
    });
}

function readFromJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Correctly read the file as a string
        return data; // Return the raw string data for outside parsing
    } catch (err) {
        console.error("Error reading file from disk:", err);
        throw err; // Re-throw to handle it in the calling code
    }
}

module.exports = {
    writeToJsonFile,
    readFromJsonFile
};