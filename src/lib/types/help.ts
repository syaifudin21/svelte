export interface HelpCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  relevance?: number | null;
}

export interface HelpCategoryResponse {
  data: HelpCategory[];
  message: string;
}

export interface FAQResponse {
  data: FAQ[];
  message: string;
}
