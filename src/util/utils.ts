import { Chord } from "../music_theory/Chord"
import { OctavedNote } from "../music_theory/Note"

export function zip<A>(a: A[]): [A][]
export function zip<A, B>(a: A[], b: B[]): [A, B][]

export function zip(...arrays: unknown[][]): unknown[][] {
	const maxLength = Math.max(...arrays.map((arr) => arr.length))
	return Array.from({ length: maxLength }).map((_, i) =>
		arrays.map((arr) => arr[i]),
	)
}

export const arrayEquals = <T>(a: T[], b: T[]) => {
	return a.length === b.length && a.every((v, i) => v === b[i])
}

export const lastChords: Chord[][] = []

export const lockedChords: Chord[][] = []

export const lastMelody: OctavedNote[][][] = []

export const lockedMelody: OctavedNote[][][] = []
