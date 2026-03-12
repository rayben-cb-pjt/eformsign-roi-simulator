import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConsultingModal: React.FC<ConsultingModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
        }
    }, [isOpen]);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-auto max-h-[85vh] flex flex-col overflow-hidden relative">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                                <h3 className="font-bold text-lg text-slate-800">ROI 리포트 & 맞춤형 솔루션 제안</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Iframe Content with Loading Indicator */}
                            <div className="flex-1 bg-slate-50 relative min-h-[500px]">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                                            <p className="text-sm text-slate-500">채널톡을 불러오는 중...</p>
                                        </div>
                                    </div>
                                )}
                                <iframe
                                    src="https://eformsign.channel.io"
                                    className="absolute inset-0 w-full h-full border-0"
                                    title="eformsign Consulting Channel"
                                    allow="clipboard-write"
                                    onLoad={() => setIsLoading(false)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
