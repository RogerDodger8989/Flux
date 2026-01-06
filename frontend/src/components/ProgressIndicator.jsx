function ProgressIndicator({ progress = 0, label = 'Laddar...', show = true }) {
    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-primary border border-default rounded-lg shadow-2xl p-4 min-w-[300px] animate-slide-up z-40">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-primary">{label}</span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                    className="bg-primary-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="mt-2 text-right text-xs text-tertiary">
                {progress}%
            </div>
        </div>
    );
}

export default ProgressIndicator;
