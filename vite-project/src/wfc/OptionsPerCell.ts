export class OptionsPerCell<T> {
	cells : Map<number, T[]>
	allOptions : T[]

	constructor(allOptions : T[], map? : Map<number, T[]>) {
		this.cells = map ?? new Map<number, T[]>()
		this.allOptions = allOptions
	}

	public reset(): void {
		this.cells.clear()
	}

	public setOptions(position : number, options : T[]): void {
		this.cells.set(position, options)
	}

	public setValue(position : number, value : T): void {
		this.cells.set(position, [value])
	}

	public getOptions(position : number): T[] {
		return this.cells.get(position) || this.allOptions
	}

	public getAllOptions(): T[] {
		return this.allOptions
	}

	public union(other: OptionsPerCell<T>): OptionsPerCell<T> {
		const newAllOptions = [...this.allOptions, ...other.allOptions]
    
		const newOptionsPerCell = new OptionsPerCell<T>(newAllOptions)

		for(const [position, options] of this.cells) {
			newOptionsPerCell.setOptions(position, options)
		}
		for(const [position, options] of other.cells) {
			newOptionsPerCell.setOptions(position, options)
		}

		return newOptionsPerCell
	}


}