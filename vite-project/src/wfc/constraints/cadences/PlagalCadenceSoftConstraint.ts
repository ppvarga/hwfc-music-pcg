import { ConcreteChordQuality } from "../../../music_theory/Chord"
import { MusicalKey } from "../../../music_theory/MusicalKey"
import { Grabber } from "../../Grabber"
import { constantGrabber } from "../../grabbers/constantGrabbers"
import { chordConstraintTypeToName } from "../constraintUtils"
import { GenericCadenceSoftConstraint } from "./GenericCadenceSoftConstraint"

export class PlagalCadenceSoftConstraint extends GenericCadenceSoftConstraint {
	name = chordConstraintTypeToName.get("PlagalCadenceSoftConstraint") as string
	configText = () => `Key: ${this.keyGrabber.configText()}, Bonus: ${this.bonus}`
	constructor(bonus: number, keyGrabber: Grabber<MusicalKey>) {
		super(bonus, constantGrabber(5), constantGrabber(0), constantGrabber("major" as ConcreteChordQuality), constantGrabber("major" as ConcreteChordQuality), keyGrabber)
	}
}