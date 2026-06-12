export interface Env {
  DB: D1Database;
  NEXT_PUBLIC_BASE_URL: string;
  GOOGLE_ANALYTICS_TOKEN?: string;
  GA_PROPERTY_ID?: string;
  GOOGLE_TRENDS_TOKEN?: string;
  SERPAPI_TOKEN?: string;
  GITHUB_TOKEN?: string;
  CLOUDINARY_SECRET_NAME?: string;
  CLOUDINARY_SECRET_KEY?: string;
  CLOUDINARY_SECRET?: string;
  GOOGLE_MEASUREMENT_ID?: string;
  GA_API_SECRET?: string;
}