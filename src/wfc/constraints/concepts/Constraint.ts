import { HigherValues } from "../../HigherValues"
import { Tile } from "../../Tile"
import { TileCanvas } from "../../TileCanvas"

export type Constraint<T> = HardConstraint<T> | SoftConstraint<T> | InterMelodyConstraint<T>

export interface HardConstraint<T> {
	name: string
	check: (tile: Tile<T>, higherValues: HigherValues) => boolean
}

export interface InterMelodyConstraint<T> {
	name: string
	checkIM: (tile: Tile<T>, otherInstrument: TileCanvas<T>) => boolean
}

export function isInterMelodyConstraint<T>(
	constraint: Constraint<T>,
): constraint is InterMelodyConstraint<T> {
	return "checkIM" in constraint
}

export function isHardConstraint<T>(
	constraint: Constraint<T>,
): constraint is HardConstraint<T> {
	return "check" in constraint
}

export abstract class SoftConstraint<T> {
	abstract name: string
	abstract weight(tile: Tile<T>, higherValues: HigherValues): number
	protected bonus: number

	constructor(bonus: number) {
		this.bonus = bonus
	}
}
