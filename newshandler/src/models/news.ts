import { Schema, model, connect, now } from "mongoose";
 
interface INews {
    title: string;
    content: string;
    images: string[];
    category: string;
    articleUrl: string;
    datePublished: Date;
    dateCreated: Date;
    summary: string;
}

const newsSchema = new Schema<INews>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    articleUrl: { type: String, required: true, unique: true },
    datePublished: { type: Date, required: true },
    dateCreated: { type: Date, default: now() },
    summary: {type: String, required: true}
});

newsSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
    },
});

const News = model<INews>("News", newsSchema);

export { News };
