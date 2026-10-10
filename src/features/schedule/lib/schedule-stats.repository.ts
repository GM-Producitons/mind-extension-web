import { connectMongoose } from "@/lib/db";
import { FlashcardModel } from "@/features/shared/models/flashcard.model";
import { MyInstaPostModel } from "@/features/shared/models/myinsta-post.model";

export interface FlashcardStats {
  total: number;
  memorized: number;
  knewTotal: number;
  missedTotal: number;
}

export interface PostsPerWeek {
  week: string;
  count: number;
}

export async function getFlashcardStats(): Promise<FlashcardStats> {
  await connectMongoose();
  const [total, memorized, agg] = await Promise.all([
    FlashcardModel.countDocuments(),
    FlashcardModel.countDocuments({ lastResult: "knew" }),
    FlashcardModel.aggregate<{ knew: number; missed: number }>([
      {
        $group: {
          _id: null,
          knew: { $sum: "$knewCount" },
          missed: { $sum: "$missedCount" },
        },
      },
    ]),
  ]);
  const row = agg[0];
  return {
    total,
    memorized,
    knewTotal: row?.knew ?? 0,
    missedTotal: row?.missed ?? 0,
  };
}

export async function getPostsPerWeek(limitWeeks = 8): Promise<PostsPerWeek[]> {
  await connectMongoose();
  const rows = await MyInstaPostModel.aggregate<{ week: string; count: number }>(
    [
      {
        $group: {
          _id: {
            $dateToString: { format: "%G-W%V", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limitWeeks },
      { $project: { week: "$_id", count: 1, _id: 0 } },
    ],
  );
  return rows.reverse();
}
