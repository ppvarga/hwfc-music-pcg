import { Equatable } from "../../../util/utils"
import { HigherValues } from "../../HigherValues"
import { Tile } from "../../Tile"

export type Constraint<T extends Equatable> = HardConstraint<T> | SoftConstraint<T>

export interface HardConstraint<T extends Equatable> {
	name: string
	check: (tile: Tile<T>, higherValues: HigherValues) => boolean
}

export function isHardConstraint<T extends Equatable>(
	constraint: Constraint<T>,
): constraint is HardConstraint<T> {
	return "check" in constraint
}

export abstract class SoftConstraint<T extends Equatable> {
	abstract name: string
	abstract weight(tile: Tile<T>, higherValues: HigherValues): number
	protected bonus: number

	constructor(bonus: number) {
		this.bonus = bonus
	}
}
