import mongoose from "mongoose";

const { Schema } = mongoose;

export interface MyInstaImage {
  url: string;
  pathname: string;
  width?: number;
  height?: number;
  order: number;
}

export interface MyInstaPostMongooseDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  caption: string;
  images: MyInstaImage[];
  liked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MyInstaImageSchema = new Schema<MyInstaImage>(
  {
    url: { type: String, required: true },
    pathname: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const MyInstaPostSchema = new Schema<MyInstaPostMongooseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true, trim: true },
    caption: { type: String, default: "", trim: true },
    images: { type: [MyInstaImageSchema], required: true },
    liked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

MyInstaPostSchema.index({ userId: 1, createdAt: -1 });

if (mongoose.models.MyInstaPost) {
  mongoose.deleteModel("MyInstaPost");
}

export const MyInstaPostModel = mongoose.model<MyInstaPostMongooseDocument>(
  "MyInstaPost",
  MyInstaPostSchema,
);
