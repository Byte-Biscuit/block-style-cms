// Type definitions for VirtualizedMasonry component
export interface MasonryImage {
    id: number | string;
    url: string; // Main display image URL
    photographer?: string; // Photographer/author information, optional
    width: number;
    height: number;
    alt?: string; // Image alt text, optional
    title?: string; // Image title, optional
    metadata?: Record<string, unknown>; // Additional metadata for flexible extension
}

export interface VirtualizedMasonryProps {
    images: MasonryImage[];
    columnCount: number;
    selectedImageId?: number | string | null;
    onImageSelect?: (image: MasonryImage) => void;
    gap?: number;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
    height?: string;
    imageOptimizer?: (imageUrl: string, preset: string) => string;
    showPhotographer?: boolean;
    showSelection?: boolean;
    imagePreset?: string;
}
