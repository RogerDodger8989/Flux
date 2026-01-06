import { execFile } from 'child_process';
import path from 'path';

const exiftoolPath = 'C:\\Program Files\\exiftool\\exiftool.exe';
const file = 'uploads/1986 - Karlskrona_exposure_1767707643400.jpg';
const filepath = path.resolve(process.cwd(), file);

console.log('Testing execFile...');
console.log('Exe:', exiftoolPath);
console.log('File:', filepath);

execFile(exiftoolPath, ['-j', '-g', filepath], (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error);
        return;
    }

    try {
        const data = JSON.parse(stdout)[0];
        console.log('SUCCESS!');
        console.log('Output keys:', Object.keys(data));
        console.log('Tools/Software keys:', data['XMP'] ? Object.keys(data['XMP']) : 'No XMP');
    } catch (e) {
        console.error('Parse error:', e);
        console.log('Raw stdout:', stdout);
    }
});
