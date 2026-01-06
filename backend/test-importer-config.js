import { ExifTool } from 'exiftool-vendored';
import path from 'path';

// EXACT COPY of the initialization in imageImporter.js
const exiftoolPath = 'C:\\Program Files\\exiftool\\exiftool.exe';
const exiftool = new ExifTool({ exiftoolPath });

const file = 'uploads/1986 - Karlskrona_exposure_1767707643400.jpg';
const filepath = path.resolve(process.cwd(), file);

console.log('Testing ExifTool wrapper with explicit path...');
console.log('Path:', exiftoolPath);
console.log('File:', filepath);

async function run() {
    try {
        console.log('Reading tags...');
        const tags = await exiftool.read(filepath);
        console.log('SUCCESS! Tags found:', Object.keys(tags).length);
        console.log('Title:', tags.Title);
        console.log('Keywords:', tags.Keywords);
        console.log('People:', tags.PersonInImage);
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await exiftool.end();
    }
}

run();
