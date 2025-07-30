


export const parsePlayerCount = (maxParticipants: string | null): number => {
    if (!maxParticipants) return 0;
    
    // Case 1: "400 players"
    const playersMatch = maxParticipants.match(/(\d+)\s*players/i);
    if (playersMatch && playersMatch[1]) {
        return parseInt(playersMatch[1], 10);
    }

    // Case 2: "100 teams" (assuming 4 players per team for Free Fire Max Squad mode)
    const teamsMatch = maxParticipants.match(/(\d+)\s*teams/i);
    if (teamsMatch && teamsMatch[1]) {
        return parseInt(teamsMatch[1], 10) * 4;
    }

    // Case 3: Just a number "400"
    const numberMatch = maxParticipants.match(/^\d+$/);
    if (numberMatch) {
        return parseInt(maxParticipants, 10);
    }
    
    // Default case if no pattern matches
    return 0;
};


export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

export const sanitizeUrl = (url: string | null | undefined): string | null => {
    if (!url) {
        return null;
    }

    // Allow data URIs for images
    if (url.startsWith('data:image/')) {
        // A simple check to ensure it's a valid-looking data URI
        const parts = url.split(';');
        if (parts.length >= 2 && parts[1].startsWith('base64,')) {
            return url;
        }
    }

    // Allow http/https URLs
    try {
        const parsedUrl = new URL(url);
        if (['http:', 'https:'].includes(parsedUrl.protocol)) {
            return url;
        }
    } catch (e) {
        // Not a valid http/https URL, fall through to return null
    }

    return null;
};

export const getTransformedImageUrl = (
    originalUrl: string | null | undefined,
    options: { width: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' }
): string | null => {
    if (!originalUrl) {
        return null;
    }
    
    // Check if it's a Supabase storage URL that can be transformed.
    const isSupabaseStorageUrl = originalUrl.includes('supabase.co/storage/v1/object/public/');
    
    if (!isSupabaseStorageUrl) {
        // Return original URL if it's not transformable (e.g., a data URI or Dicebear fallback).
        return originalUrl;
    }
    
    // Replace /object/ with /render/image/ to use the Image Transformation API.
    const transformedUrl = originalUrl.replace('/object/public/', '/render/image/public/');
    
    const params = new URLSearchParams({
        width: String(options.width),
        quality: String(options.quality || 80),
        resize: options.resize || 'cover',
    });

    if (options.height) {
        params.append('height', String(options.height));
    }

    return `${transformedUrl}?${params.toString()}`;
};