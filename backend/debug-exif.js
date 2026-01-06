import { exec } from 'child_process';
import path from 'path';

const file = 'uploads/1986 - Karlskrona_exposure_1767707643400.jpg';
const filepath = path.resolve(process.cwd(), file);
// Try system path or common location
const exifPath = 'C:\\Program Files\\exiftool\\exiftool.exe';

console.log('Testing native exiftool execution...');
console.log('File:', filepath);

exec(`"${exifPath}" -j -g "${filepath}"`, (error, stdout, stderr) => {
    if (error) {
        console.error('Exec error:', error);
        // Try just 'exiftool' in case it is in path but not at that location
        exec(`exiftool -j -g "${filepath}"`, (err2, out2, stderr2) => {
            if (err2) {
                console.error('Fallback error:', err2);
            } else {
                console.log('Fallback Output:', out2);
            }
        });
        return;
    }
    console.log('Output:', stdout);
});
