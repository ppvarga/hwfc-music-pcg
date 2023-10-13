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

function App() {

	const tabs = [
		{
			title: "Main",
			content: <>
				<div className="main-div">
					<GlobalSettings />
					<div className="main-column">
						<h2>Chords</h2>
						<ChordTiles />
						<ChordConstraints />
					</div>
					<div className="main-column">
						<h2>Melody</h2>
						<NoteTiles />
						<NoteConstraints />
					</div>
					<Output />
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
		}
	]

	return (
		<AppProvider>
			<h1>WFC Music</h1>
			<TabComponent tabs={tabs} />
		</AppProvider>
	)
}

export default App