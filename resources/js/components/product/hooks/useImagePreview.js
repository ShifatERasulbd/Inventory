import { useEffect, useState } from 'react';

export default function useImagePreview(file) {
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!file) {
            setPreview('');
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return preview;
}