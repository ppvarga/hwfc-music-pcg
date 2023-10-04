import { HigherValues } from "../HigherValues"

export const RootOfChordGrabber = (higherValues: HigherValues) =>
	higherValues.getChord().getRoot()

export const ThirdOfChordGrabber = (higherValues: HigherValues) =>
	higherValues.getChord().getThird()

export const FifthOfChordGrabber = (higherValues: HigherValues) =>
	higherValues.getChord().getFifth()
