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

function App() {

	const tabs = [
		{
			title: "Main",
			content: <>
				<div className="main-div">
					<GlobalSettings />
					<div className="main-column">
						<SectionTiles />
					</div>
					<div className="main-column">
						<ChordTiles />
						<ChordConstraints />
					</div>
					<div className="main-column">
						<NoteTiles />
						<NoteConstraints />
					</div>
				</div>
				<Output/>
			</>
		},
		{
			title: "Sections",
			content: <><SectionsPage /><Output /></>
		},
		{
			title: "Chord prototypes",
			content: <><ChordPrototypesPage /><Output /></>
		},
		{
			title: "Configs",
			content: <><Configs /><Output /></>
		},
		{
			title: "Output",
			content: <Output isOutput={true}/>
		}
	]

	return (
		<AppProvider>
			<TabComponent tabs={tabs} />
		</AppProvider>
	)
}

export default App