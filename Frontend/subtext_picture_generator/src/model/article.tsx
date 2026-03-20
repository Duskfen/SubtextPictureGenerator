import { Picture } from "./picture";

export interface Article {
  title: string;
  categories: string[];
  author: string;
  date: string;
  picture: Picture;
  subtitle: string | null;
}
