#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're running from the project root
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');

// Source PNG file
const sourcePng = path.join(publicDir, '512.png');

// Output paths
const icoOutput = path.join(publicDir, 'icon.ico');
const icnsOutput = path.join(publicDir, 'icon.icns');

// Create scripts directory if it doesn't exist
if (!fs.existsSync(path.dirname(__filename))) {
    fs.mkdirSync(path.dirname(__filename), { recursive: true });
}

console.log('Generating application icons...');

try {
    // Generate .ico file
    console.log('Generating icon.ico...');
    execSync(`png2icons "${sourcePng}" "${icoOutput}" -ic`);
    console.log('✓ icon.ico created successfully');

    // Generate .icns file
    console.log('Generating icon.icns...');
    execSync(`png2icons "${sourcePng}" "${icnsOutput}" -i`);
    console.log('✓ icon.icns created successfully');

    console.log('\nIcon generation complete! Files created:');
    console.log(`- ${icoOutput}`);
    console.log(`- ${icnsOutput}`);
} catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
}
