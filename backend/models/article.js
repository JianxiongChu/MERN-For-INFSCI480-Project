import mongoose from "mongoose";

const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: { type: String, required: true, maxLength: 2047 },
  abstract: { type: String, required: true },
  publication_year: { type: String, required: true },
  end_page: { type: Number, required: true, maxLength: 10 },
  doi: { type: String, required: true, maxLength: 2047 },
  affiliation: { type: String, required: true, maxLength: 2047 },
  pubtype: { type: String, required: true, maxLength: 2047 },
  keywords: { type: Array, required: true },
  author: { type: Array, required: true },
});

export const Article = mongoose.model("metadatas", articleSchema);
