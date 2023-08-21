import { Note } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"

export function rootOfChordGrabber(): Grabber<Note> {
	return {
		grab: (higherValues: HigherValues) => higherValues.getChord().getRoot(),
		configText: () => "root of chord",
	}
}

export function thirdOfChordGrabber(): Grabber<Note> {
	return {
		grab: (higherValues: HigherValues) => higherValues.getChord().getThird(),
		configText: () => "third of chord",
	}
}

export function fifthOfChordGrabber(): Grabber<Note> {
	return {
		grab: (higherValues: HigherValues) => higherValues.getChord().getFifth(),
		configText: () => "fifth of chord",
	}
}