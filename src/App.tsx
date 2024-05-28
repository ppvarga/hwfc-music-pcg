import "./App.css"
import { AppProvider } from "./AppState"
import { Output } from "./components/Output"
import { GlobalSettings } from "./components/GlobalSettings"
import { ChordConstraints } from "./components/ChordConstraints"
import { ChordTiles } from "./components/ChordTiles"
import { NoteConstraints } from "./components/NoteConstraints"
import { NoteTiles } from "./components/NoteTiles"
import TabComponent from "./components/TabComponent"
import { ChordPrototypesPage } from "./components/ChordPrototypesPage"
import { SectionsPage } from "./components/SectionsPage"
import { SectionTiles } from "./components/SectionTiles"
import { Configs } from "./components/Configs"
import { NumberOfInstruments } from "./components/NumberOfInstruments"
import { InterMelodyConstraints } from "./components/InstrumentConstraints"
import { CollapseType } from "./components/CollapseType"
import { InstrumentSelector } from "./components/InstrumentSelector"

function App() {

	const tabs = [
		{
			title: "Main",
			content: <>
				<div className="main-div">
					<GlobalSettings />
					<div className="main-column">
						<SectionTiles />
						<NumberOfInstruments />
						<CollapseType />
						<InterMelodyConstraints />
					</div>
					<div className="main-column">
						<ChordTiles />
						<ChordConstraints />
					</div>
					<div className="main-column">
						<InstrumentSelector />
						<NoteTiles />
						<NoteConstraints />
					</div>
				</div>
			</>
		},
		{
			title: "Sections",
			content: <SectionsPage />
		},
		{
			title: "Chord prototypes",
			content: <ChordPrototypesPage />
		},
		{
			title: "Configs",
			content: <Configs />
		}
	]

	return (
		<AppProvider>
			<TabComponent tabs={tabs} />
			<Output/>
		</AppProvider>
	)
}

export default App