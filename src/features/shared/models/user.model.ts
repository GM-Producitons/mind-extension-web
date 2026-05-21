import mongoose from "mongoose";

const { Schema } = mongoose;

export interface UserDocument extends mongoose.Document {
  email: string;
  name: string;
  password: string;
  isMe: boolean;
  utcOffset: number;
  ttrTags: string[];
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    isMe: { type: Boolean, required: true, default: false },
    utcOffset: { type: Number, required: true, default: 0 },
    ttrTags: [{ type: String, default: [] }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.User) {
  mongoose.deleteModel("User");
}

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
