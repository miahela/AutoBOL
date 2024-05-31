const fs = require('fs');

// Function to write data to a JSON file
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

// Function to read data from a JSON file
function readFromJsonFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
        } else {
            const jsonData = JSON.parse(data);
            console.log('Data read from JSON file:', jsonData);
        }
    });
}

module.exports = {
    writeToJsonFile,
    readFromJsonFile
};