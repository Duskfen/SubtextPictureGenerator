import { Picture } from "./picture";

export class Article {

    public title: string;
    public categories: string[];
    public author: string;
    public date: string;
    public picture: Picture;

    constructor(title: string, categories: string[], author:string, date: string, picture: Picture) {
        this.categories = categories;
        this.title = title;
        this.author = author;
        this.date = date;
        this.picture = picture;
    }
}