import { useState } from 'react';
import useImageStore from '../store/imageStore';
import ProgressIndicator from './ProgressIndicator';

function ImportModal({ isOpen, onClose }) {
    const [folderPath, setFolderPath] = useState('');
    const [scanResults, setScanResults] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');

    const { scanFolder, importImages, uploadFiles, importing, importProgress, importStatus } = useImageStore();

    const handleScan = async () => {
        if (!folderPath.trim()) {
            setError('Ange en mappsökväg');
            return;
        }

        setError('');
        setScanning(true);
        setScanResults(null);

        try {
            const results = await scanFolder(folderPath);
            setScanResults(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setScanning(false);
        }
    };

    const handleFolderSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            // Get the path from the first file
            const firstFile = files[0];
            // Extract folder path (remove filename)
            const fullPath = firstFile.webkitRelativePath || firstFile.name;
            const pathParts = fullPath.split('/');

            // Build a more informative path display
            // Remove the filename (last part) to get just the folder structure
            pathParts.pop();
            const folderStructure = pathParts.join('/');

            // Show the folder structure in the input
            setFolderPath(`📁 ${folderStructure} (${files.length} filer valda)`);

            // Automatically trigger scan with the selected files
            handleBrowserFolderScan(Array.from(files));
        }
    };

    const handleBrowserFolderScan = async (files) => {
        setScanning(true);
        setError('');

        try {
            // Filter for supported image types
            const imageFiles = files.filter(file => {
                const ext = file.name.toLowerCase();
                return ext.match(/\.(jpg|jpeg|png|gif|webp|bmp|heic|heif|tiff|tif|cr2|nef|arw|dng|orf|rw2|pef|pcx|psd|svg|mp4|mov|avi|mkv|webm|m4v|wmv|flv)$/);
            });

            if (imageFiles.length === 0) {
                setError('Inga bilder hittades i vald mapp');
                setScanning(false);
                return;
            }

            // Create a mock scan result
            setScanResults({
                filesFound: imageFiles.length,
                files: imageFiles.map(f => f.name),
                browserFiles: imageFiles, // Store actual File objects
            });
            setScanning(false);
        } catch (err) {
            setError(err.message);
            setScanning(false);
        }
    };

    const handleImport = async () => {
        if (!scanResults || scanResults.filesFound === 0) return;

        try {
            setError('');

            // Check if we have browser-selected files
            if (scanResults.browserFiles) {
                const results = await uploadFiles(scanResults.browserFiles);

                if (results.errors.length > 0) {
                    setError(`${results.imported} bilder importerade, ${results.errors.length} fel`);
                } else if (results.skipped > 0) {
                    setError(`${results.imported} bilder importerade, ${results.skipped} hoppades över (redan importerade)`);
                }
            } else {
                // Use scan/import for manual path
                const results = await importImages(scanResults.files || []);

                if (results.errors.length > 0) {
                    setError(`${results.imported} bilder importerade, ${results.errors.length} fel`);
                }
            }

            // Close modal after successful import
            setTimeout(() => {
                onClose();
                setScanResults(null);
                setFolderPath('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleClose = () => {
        if (!importing) {
            onClose();
            setScanResults(null);
            setFolderPath('');
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                onClick={handleClose}
            >
                <div
                    className="bg-primary max-w-2xl w-full mx-4 rounded-2xl shadow-2xl animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-default">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-primary">📂 Importera bilder</h2>
                            <button
                                onClick={handleClose}
                                disabled={importing}
                                className="p-2 hover:bg-secondary rounded-lg transition text-secondary disabled:opacity-50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Folder path input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-primary mb-2">
                                Välj mapp
                            </label>

                            {/* Browse button */}
                            <div className="mb-3">
                                <input
                                    type="file"
                                    webkitdirectory="true"
                                    directory="true"
                                    multiple
                                    onChange={handleFolderSelect}
                                    className="hidden"
                                    id="folder-input"
                                    disabled={scanning || importing}
                                />
                                <label
                                    htmlFor="folder-input"
                                    className={`w-full px-4 py-3 bg-secondary border-2 border-dashed border-primary-500 hover:border-primary-600 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 text-primary font-medium ${(scanning || importing) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    Bläddra efter mapp...
                                </label>
                            </div>

                            {/* Manual path input */}
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={folderPath}
                                    onChange={(e) => setFolderPath(e.target.value)}
                                    placeholder="Eller ange manuell sökväg: C:\Users\Username\Pictures"
                                    className="flex-1 px-4 py-3 bg-secondary border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary text-sm"
                                    disabled={scanning || importing}
                                />
                            </div>

                            <p className="text-xs text-tertiary mt-2">
                                Använd "Bläddra" för att välja en mapp, eller ange sökvägen manuellt
                            </p>
                        </div>

                        {/* Scan button */}
                        {folderPath && !folderPath.startsWith('📁') && (
                            <div className="mb-4">
                                <button
                                    onClick={handleScan}
                                    disabled={scanning || importing || !folderPath.trim()}
                                    className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                >
                                    {scanning ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Scannar mapp...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Scanna mapp för bilder
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Scan results */}
                        {scanResults && (
                            <div className="mb-4 p-4 bg-secondary rounded-lg border border-default">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-primary">Scanningsresultat</h3>
                                    <span className="text-sm text-tertiary">
                                        {scanResults.filesFound} bilder hittade
                                    </span>
                                </div>

                                {scanResults.filesFound > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-secondary">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Redo att importera
                                        </div>
                                        <p className="text-xs text-tertiary">
                                            Stödda format: JPG, PNG, GIF, BMP, WEBP, HEIC, TIFF, PCX, PSD, SVG • RAW (CR2, NEF, ARW, DNG, ORF) • Video (MP4, MOV, AVI, MKV, WEBM)
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-secondary">Inga bilder hittades i denna mapp</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-default bg-secondary rounded-b-2xl">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                disabled={importing}
                                className="px-6 py-3 border border-default hover:bg-tertiary text-primary font-medium rounded-lg transition duration-200 disabled:opacity-50"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!scanResults || scanResults.filesFound === 0 || importing}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition duration-200 flex items-center gap-2"
                            >
                                {importing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Importerar...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Importera {scanResults?.filesFound || 0} bilder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress indicator */}
            <ProgressIndicator
                show={importing}
                progress={importProgress}
                label={importStatus}
            />
        </>
    );
}

export default ImportModal;
