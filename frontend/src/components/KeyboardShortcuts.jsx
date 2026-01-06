function KeyboardShortcuts({ onClose }) {
    const shortcuts = [
        { key: '?', description: 'Visa tangentbordsgenvä gar' },
        { key: 'Esc', description: 'Stäng dialog' },
        { key: 'j / ↓', description: 'Nästa bild' },
        { key: 'k / ↑', description: 'Föregående bild' },
        { key: 'Space', description: 'Markera bild' },
        { key: 'f', description: 'Fullskärm' },
        { key: '1-5', description: 'Sätt betyg (stjärnor)' },
        { key: 'r', description: 'Röd etikett' },
        { key: 'y', description: 'Gul etikett' },
        { key: 'g', description: 'Grön etikett' },
        { key: 'b', description: 'Blå etikett' },
        { key: 'Delete', description: 'Ta bort bild' },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-primary max-w-2xl w-full mx-4 rounded-2xl shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-default">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-primary">⌨️ Tangentbordsgenvägar</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary rounded-lg transition text-secondary"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shortcuts.map((shortcut) => (
                            <div
                                key={shortcut.key}
                                className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                            >
                                <kbd className="px-3 py-1.5 bg-tertiary border border-default rounded text-sm font-mono font-semibold text-primary min-w-[60px] text-center">
                                    {shortcut.key}
                                </kbd>
                                <span className="text-secondary">{shortcut.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-default bg-secondary rounded-b-2xl">
                    <p className="text-sm text-tertiary text-center">
                        Tryck <kbd className="px-2 py-1 bg-tertiary border border-default rounded text-xs font-mono">Esc</kbd> för att stänga
                    </p>
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcuts;
