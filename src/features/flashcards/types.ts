export type Grade = "knew" | "missed";

export type ClusterSort = "newest" | "size" | "name" | "lastTrained";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ClusterRecord {
  _id: string;
  name: string;
  lastTrainedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardCluster extends ClusterRecord {
  cardCount: number;
  knewCount: number;
  missedCount: number;
}

export interface FlashcardClusterRef {
  _id: string;
  name: string;
}

export interface Flashcard {
  _id: string;
  clue: string;
  hidden: string;
  clusterIds: string[];
  clusters: FlashcardClusterRef[];
  lastResult: Grade | null;
  lastTrainedAt: string | null;
  knewCount: number;
  missedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardInput {
  clue: string;
  hidden: string;
  clusterIds: string[];
  newClusterNames: string[];
}

export interface PracticeDeck {
  title: string;
  cards: Flashcard[];
}
