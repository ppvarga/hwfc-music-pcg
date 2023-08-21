import { HigherValues } from "../../HigherValues"
import { Tile } from "../../Tile"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Constraint<T> {
	name: string;
	configText: () => string;
}

export interface HardConstraint<T> extends Constraint<T> {
	check: (tile: Tile<T>, higherValues: HigherValues) => boolean;
}

export function isHardConstraint<T>(constraint: Constraint<T>): constraint is HardConstraint<T> {
	return "check" in constraint
}

export abstract class SoftConstraint<T> implements Constraint<T> {
	abstract name: string;
	abstract configText() : string;
	abstract weight(tile: Tile<T>, higherValues: HigherValues) : number;
	protected bonus: number

	constructor(bonus: number) {
		this.bonus = bonus
	}
}