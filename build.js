const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Path to the HTML file to be processed
const inputFolder = './_MD';
const outputFolder = './_MD';
const exclude = "./_MD/index.html";

// Function to generate a table of contents from the headers
function generateTOC(headers) {
    let tocHTML = '<div id="toc" style="position: fixed; top: 50px; right: 20px; width: 250px; background-color: rgba(255, 255, 255, 0.8); padding: 10px; border: 1px solid #ccc; font-size: 14px;">';
    tocHTML += '<h3>Table of Contents</h3><ul>';

    headers.forEach(header => {
        tocHTML += `<li><a href="#${header.id}">${header.text}</a></li>`;
    });

    tocHTML += '</ul></div>';
    return tocHTML;
}

// Function to add TOC and modify the HTML
function addTOCToHTML(inputFile, outputFile) {
    // Read the HTML file
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        // Load the HTML into cheerio for manipulation
        const $ = cheerio.load(data);

        // Array to hold headers (with their IDs and text content)
        const headers = [];

        // Find all h1, h2, and h3 elements and prepare them for the TOC
        $('h1, h2, h3').each((index, element) => {
            const $element = $(element);
            const id = $element.text().toLowerCase().replace(/[^a-z0-9]/g, '-');
            $element.attr('id', id);  // Add an ID attribute to each header

            headers.push({
                id: id,
                text: $element.text()
            });
        });

        // Generate the TOC HTML
        const tocHTML = generateTOC(headers);

        // Insert the TOC into the body (right side)
        $('body').append(tocHTML);

        // Save the modified HTML to a new file
        fs.writeFile(outputFile, $.html(), (err) => {
            if (err) {
                console.error('Error writing the file:', err);
            } else {
                console.log('Table of Contents added successfully!');
            }
        });
    });
}

// Process all HTML files in the input folder except the excluded file
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading the input folder:', err);
        return;
    }

    files.forEach(file => {
        const inputFile = path.join(inputFolder, file);
        const outputFile = path.join(outputFolder, file);

        if (inputFile !== exclude && path.extname(file) === '.html') {
            addTOCToHTML(inputFile, outputFile);
        }
    });
});
