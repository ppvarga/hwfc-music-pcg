import { InfiniteArray } from "../InfiniteArray"
import { MelodyLengthStrategy, MusicalKeyType } from "../../components/GlobalSettings"
import { RhythmStrategy } from "../../components/RhythmSettings"
import { Chord } from "../../music_theory/Chord"
import { MusicalKey } from "../../music_theory/MusicalKey"
import { Note, OctavedNote, OctavedNoteIR } from "../../music_theory/Note"
import { RhythmPatternOptions } from "../../music_theory/Rhythm"
import { ConstraintSet } from "../ConstraintSet"
import { OptionsPerCell } from "../OptionsPerCell"
import { TileCanvasProps } from "../TileCanvas"
import { ChordConstraintIR, NoteConstraintIR, convertIRToChordConstraint, convertIRToNoteConstraint } from "../constraints/constraintUtils"
import { ChordPrototypeIR, Chordesque, ChordesqueIR, chordesqueIRMapToChordesqueMap } from "./Chordesque"

interface SectionProps {
    name: string
    noteCanvasProps: TileCanvasProps<OctavedNote>
    chordesqueCanvasProps: TileCanvasProps<Chordesque>
    rhythmPatternOptions: RhythmPatternOptions
    melodyLength: number
    melodyLengthStrategy: MelodyLengthStrategy
    rhythmStrategy: RhythmStrategy
    useDifferentMelodyKey: boolean
    melodyKey: MusicalKey
}

export class Section {
	private name: string
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private rhythmPatternOptions: RhythmPatternOptions
    private melodyLength: number
    private melodyLengthStrategy: MelodyLengthStrategy
    private rhythmStrategy: RhythmStrategy
    private useDifferentMelodyKey: boolean
    private melodyKey: MusicalKey

	constructor({
        name,
        noteCanvasProps,
        chordesqueCanvasProps,
        rhythmPatternOptions,
        melodyLength,
        melodyLengthStrategy,
        rhythmStrategy,
        useDifferentMelodyKey,
        melodyKey,
    }: SectionProps) {
        this.name = name
        this.noteCanvasProps = noteCanvasProps
        this.chordesqueCanvasProps = chordesqueCanvasProps
        this.rhythmPatternOptions = rhythmPatternOptions
        this.melodyLength = melodyLength
        this.melodyLengthStrategy = melodyLengthStrategy
        this.rhythmStrategy = rhythmStrategy
        this.useDifferentMelodyKey = useDifferentMelodyKey
        this.melodyKey = melodyKey
    }

	getNoteCanvasProps() {
		return this.noteCanvasProps
	}

	getChordesqueCanvasProps() {
		return this.chordesqueCanvasProps
	}

	getRhythmPatternOptions() {
		return this.rhythmPatternOptions
	}

	getName() {
		return this.name
	}

    getMelodyLength() {
        return this.melodyLength
    }

    getMelodyLengthStrategy() {
        return this.melodyLengthStrategy
    }

    getRhythmStrategy() {
        return this.rhythmStrategy
    }

    getUseDifferentMelodyKey() {
        return this.useDifferentMelodyKey
    }

    getMelodyKey() {
        return this.melodyKey
    }
}

export const SectionInit = (id: number) => {
    return {
		name: "",
		id: id,
		noteCanvasProps: {
			size: 4,
			optionsPerCell: new InfiniteArray<OctavedNoteIR[]>(),
			constraints: [] as NoteConstraintIR[],
		},
		chordesqueCanvasProps: {
			size: 4,
			optionsPerCell: new InfiniteArray<ChordesqueIR[]>(),
			constraints: [] as ChordConstraintIR[],
		},
		allowedPrecedingSections: [] as string[],
		allowedFollowingSections: [] as string[],
		restrictPrecedingSections: false,
		restrictFollowingSections: false,
		rhythmStrategy: "Inherit" as RhythmStrategy,
		melodyLengthStrategy: "Inherit" as MelodyLengthStrategy,
		melodyLength: 4,
		rhythmPatternOptions: {
			onlyStartOnNote: true,
			minimumNumberOfNotes: 3,
			maximumRestLength: 1,
		} as RhythmPatternOptions,
        useDifferentKey: false,
        keyRoot: Note.C,
        keyType: "major" as MusicalKeyType,
		useDifferentMelodyKey: false,
		melodyKeyRoot: Note.C,
		melodyKeyType: "major" as MusicalKeyType,
	}
}

export type SectionIR = ReturnType<typeof SectionInit>

export function nameOfSectionIR(sectionIR: SectionIR) {
    return sectionIR.name === "" ? `Section${sectionIR.id}` : sectionIR.name
}

export function sectionIRToSection(
    sectionIR: SectionIR,
    chordPrototypes: ChordPrototypeIR[],
): Section {
    const noteCanvasProps = new TileCanvasProps(
        sectionIR.noteCanvasProps.size,
        new OptionsPerCell(
            OctavedNote.all(),
            sectionIR.noteCanvasProps.optionsPerCell.transform(OctavedNote.multipleFromIRs),
        ),
        new ConstraintSet(
            sectionIR.noteCanvasProps.constraints.map((noteConstraint) =>
                convertIRToNoteConstraint(noteConstraint)
            )
        )
    )
    const chordesqueCanvasProps = new TileCanvasProps(
        sectionIR.chordesqueCanvasProps.size,
        new OptionsPerCell(
            Chord.allBasicChords() as Chordesque[],
            chordesqueIRMapToChordesqueMap(sectionIR.chordesqueCanvasProps.optionsPerCell, chordPrototypes)
        ),
        new ConstraintSet(
            sectionIR.chordesqueCanvasProps.constraints.map((chordConstraint) =>
                convertIRToChordConstraint(chordConstraint)
            )
        )
    )

    return new Section({
        ...sectionIR,
        noteCanvasProps,
        chordesqueCanvasProps,
        melodyKey: MusicalKey.fromRootAndType(
            sectionIR.melodyKeyRoot,
            sectionIR.melodyKeyType,
        ),
    })
}

export function sectionIRMapToSectionMap(
	sectionIRMap: InfiniteArray<SectionIR[]>,
    sections: SectionIR[],
	chordPrototypes: ChordPrototypeIR[],
): InfiniteArray<Section[]> {
	const sectionMap = new InfiniteArray<Section[]>()

	for (const [position, sectionIRs] of sectionIRMap.entries()) {
		const sectionList: Section[] = sectionIRs.map(
			(sectionIR) => {
                const section = sections.find(
                    (section) => section.name === sectionIR.name,
                )
                if (section === undefined)
                    throw new Error(
                        `Section ${sectionIR.name} not found`,
                    )
                return sectionIRToSection(section, chordPrototypes)
            }
		)
		sectionMap.set(position, sectionList)
	}
	return sectionMap
}
