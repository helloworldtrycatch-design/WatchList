const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export interface JikanItem {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis: string | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  aired?: {
    from: string | null;
  };
  score: number | null;
  type: string;
  episodes: number | null;
  episodes_aired?: number | null;
  status?: string;
}

export interface JikanResponse {
  data: JikanItem[];
}

export const searchAnime = async (query: string): Promise<JikanResponse> => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching anime:', error);
    return { data: [] };
  }
};

export const getTopAnime = async (): Promise<JikanResponse> => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/top/anime?limit=20`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return { data: [] };
  }
};