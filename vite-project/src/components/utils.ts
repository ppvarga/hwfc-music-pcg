import { Note } from "../music_theory/Note"

export type SelectOption = {
  value: string;
  label: string;
} | null

export type SelectNoteOption = {
  value: Note;
  label: string;
} | null