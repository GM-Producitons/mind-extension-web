export type Gender = "male" | "female";

export type PersonEntryKind = "like" | "hate" | "moment";

export interface PersonMoment {
  text: string;
  createdAt: string;
}

export interface Person {
  _id: string;
  name: string;
  gender: Gender;
  birthday: string | null;
  likes: string[];
  hates: string[];
  moments: PersonMoment[];
  linkedIds: string[];
  createdAt: string;
}

export interface PersonGraph {
  nodes: { id: string; name: string }[];
  links: { source: string; target: string }[];
}
