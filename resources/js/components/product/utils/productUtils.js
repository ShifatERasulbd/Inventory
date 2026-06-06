export const stripHtmlTags = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const toDisplayPart = (value) => {
    const cleaned = stripHtmlTags(value);
    if (!cleaned) return null;
    return String(cleaned);
};