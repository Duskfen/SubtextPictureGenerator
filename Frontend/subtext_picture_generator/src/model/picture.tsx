export class Picture{
    author: string|null;
    src: string;

    constructor(author: string|null, src:string){
        this.author = author;
        this.src = src;
    }

}