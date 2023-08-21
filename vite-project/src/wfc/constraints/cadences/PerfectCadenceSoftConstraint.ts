
import { ConcreteChordQuality } from "../../../music_theory/Chord"
import { GenericCadenceSoftConstraint } from "./GenericCadenceSoftConstraint"
import { Grabber } from "../../Grabber"
import { constantGrabber } from "../../grabbers/constantGrabbers"
import { MusicalKey } from "../../../music_theory/MusicalKey"
import { chordConstraintTypeToName } from "../constraintUtils"

export class PerfectCadenceSoftConstraint extends GenericCadenceSoftConstraint {
	name = chordConstraintTypeToName.get("PerfectCadenceSoftConstraint") as string
	configText = () => `Key: ${this.keyGrabber.configText()}, Bonus: ${this.bonus}`
	constructor(bonus: number, keyGrabber: Grabber<MusicalKey>) {
		super(bonus, constantGrabber(7), constantGrabber(0), constantGrabber("major" as ConcreteChordQuality), constantGrabber("major" as ConcreteChordQuality), keyGrabber)
	}
}