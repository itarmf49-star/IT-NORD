export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  youtubeId: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
};
