import { PassiveAppState, errorsInAppState, useAppContext } from "../AppState";
import React, { useRef, useState } from 'react';
import {MidiToNoteOutput, MidiToNoteOutput2, NoteOutput2} from "../audio/midi"
import { MidiPlayer, NoteOutput } from "./MidiPlayer";
import { NoteTiles } from "./NoteTiles";
import { NoteConstraints } from "./NoteConstraints";
import { ChordConstraints } from "./ChordConstraints";
import { ChordTiles } from "./ChordTiles";
import axios from "axios";
import { MidiFile, read } from "midifile-ts";
import { Chord } from "../music_theory/Chord";
import { OctavedNote, parseOctavedNoteIR, noteToInt, OctavedNoteIR, intToNote, Note } from "../music_theory/Note";
import { Random } from "../util/Random";
import { ConstraintSet } from "../wfc/ConstraintSet";
import { InfiniteArray } from "../wfc/InfiniteArray";
import { OptionsPerCell } from "../wfc/OptionsPerCell";
import { TileCanvasProps, TileCanvas } from "../wfc/TileCanvas";
import { ConstraintHierarchy } from "../wfc/constraints/ConstraintInferrer/ConstraintHierarchy";
import { SectionOnlyFollowedByHardConstraint } from "../wfc/constraints/SectionOnlyFollowedByHardConstraint";
import { SectionOnlyPrecededByHardConstraint } from "../wfc/constraints/SectionOnlyPrecededByHardConstraint";
import { Constraint } from "../wfc/constraints/concepts/Constraint";
import { convertIRToNoteConstraint, convertIRToChordConstraint, NoteConstraintIR, ChordConstraintIR } from "../wfc/constraints/constraintUtils";
import { constantStringArrayGrabber } from "../wfc/grabbers/constantGrabbers";
import { Chordesque, chordesqueIRMapToChordesqueMap } from "../wfc/hierarchy/Chordesque";
import { Section, sectionIRToSection, sectionIRMapToSectionMap } from "../wfc/hierarchy/Section";
import { SectionLevelNode } from "../wfc/hierarchy/SectionLevelNode";
import { parseChordPrototypes } from "./Output";
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import { Column, useTable } from 'react-table';

interface UploadButtonProps {
  onUpload: (data: any) => void;
}

interface ConstraintTableProps {
  data: Map<number, string[]>;
  constraintsSetprop: Set<string>;
}

const countMap: Map<string, number> = new Map();
const ConstraintTableMap: Map<number, string[]> = new Map() 
const constraintSet: Set<string> =  new Set()
function updateCountMap(constraint: Constraint<OctavedNote>) {
  
  const className = constraint.name; // Get the class name as a string
  if (!constraintSet.has(className)){
    constraintSet.add(className)
  }
  if (countMap.has(className)) {
    countMap.set(className, countMap.get(className)! + 1);
  } else {
    countMap.set(className, 1);
  }
}

function updateCountMapChord(constraint: Constraint<Chordesque>) {
  
  const className = constraint.name; // Get the class name as a string
  if (!constraintSet.has(className)){
    constraintSet.add(className)
  }
  if (countMap.has(className)) {
    countMap.set(className, countMap.get(className)! + 1);
  } else {
    countMap.set(className, 1);
  }
}

function updateConstraintTableMap(measureNumber: number, constraint: Constraint<OctavedNote>) {
  
  const className = constraint.name; // Get the class name as a string
  if (!constraintSet.has(className)){
    constraintSet.add(className)
  }
  if (ConstraintTableMap.has(measureNumber)) {
    ConstraintTableMap.get(measureNumber)!.push(className)
    
  } else {
    ConstraintTableMap.set(measureNumber, []);
    ConstraintTableMap.get(measureNumber)!.push(className)
  }
}

function updateConstraintTableMapChord(measureNumber: number, constraint: Constraint<Chordesque>) {
  
  const className = constraint.name; // Get the class name as a string
  if (!constraintSet.has(className)){
    constraintSet.add(className)
  }
  if (ConstraintTableMap.has(measureNumber)) {
    ConstraintTableMap.get(measureNumber)!.push(className)
    
  } else {
    ConstraintTableMap.set(measureNumber, []);
    ConstraintTableMap.get(measureNumber)!.push(className)
  }
}

export const ConstraintBarChart: React.FC = () => {
 
  const appState = useAppContext();
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const constraintCounts: { [key: string]: number } = {};
  const generateBarChart = () => {
    for (const key of countMap.keys()) {
      
          //const className = constraint.constructor.name;
          if (!constraintCounts[key]) {
              constraintCounts[key] = 0;
          }
          constraintCounts[key] += countMap.get(key)!;
      
  }
    console.log("countmap")
    console.log(countMap)
    const labels = Object.keys(constraintCounts);
    const data = Object.values(constraintCounts);
      console.log(countMap.keys())
      console.log(countMap.values())
      if (chartRef.current) {
        if (chartInstance) {
          chartInstance.destroy();
      }
      const newChartInstance = new Chart(chartRef.current, {
              type: 'bar',
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Constraint Occurrences',
                      data: data,
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                  }]
              },
              options: {
                  scales: {
                      y: {
                          beginAtZero: true
                      }
                  }
              }
          });
          setChartInstance(newChartInstance);
      }
  };

  const downloadChart = async () => {
      if (chartRef.current) {
          const canvas = chartRef.current;
          const img = await html2canvas(canvas);
          const link = document.createElement('a');
          link.href = img.toDataURL('image/png');
          link.download = 'constraint_chart.png';
          link.click();
      }
  };

  return (
      <div>
          <canvas ref={chartRef}></canvas>
          <button onClick={generateBarChart}>Generate Bar Chart</button>
          <button onClick={downloadChart}>Download Chart</button>
      </div>
  );
};


let newNotes: NoteOutput[] = [];


const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const appState = useAppContext()
  const { setOutput } = appState
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        countMap.clear()
        ConstraintTableMap.clear()
        constraintSet.clear()
        async function analyzeMidi(midiArrayBuffer: ArrayBuffer): Promise<any> {
          const formData = new FormData();
          const blob = new Blob([midiArrayBuffer], { type: 'application/octet-stream' });
          formData.append('file', blob, 'file.mid');
      
          try {
              const response = await axios.post('http://localhost:5000/analyze', formData, {
                  headers: {
                      'Content-Type': 'multipart/form-data',
              "Access-Control-Allow-Origin": "http://127.0.0.1:5173/audio-wfc/"
                  }
              });
              return response.data;
          } catch (error) {
              if (axios.isAxiosError(error)) {
                  console.error('Error analyzing MIDI file:', error.message);
              } else {
                  console.error('Unexpected error:', error);
              }
              throw error;
          }
      }
      
      const isAnalysisResult = (data: any): data is AnalysisResult => {
          return Array.isArray(data) && data.every(part => 
              Array.isArray(part) && part.every(measure =>
                  'measureNumber' in measure &&
                  'notes' in measure && Array.isArray(measure.notes) &&
                  measure.notes.every((note: { is_chord: any; pitches: any; root: any; start_time: any; duration: any; measure: any; pitch: any }) =>
                      ('is_chord' in note) &&
                      (note.is_chord 
                          ? Array.isArray(note.pitches) && typeof note.root === 'number' && typeof note.start_time === 'number' && typeof note.duration === 'number' && typeof note.measure === 'number'
                          : typeof note.pitch === 'number' && typeof note.start_time === 'number' && typeof note.duration === 'number' && typeof note.measure === 'number'
                      )
                  )
              )
          );
      }; 
      
      const convertToAnalysisResult = (data: any): AnalysisResult | null => {
          if (isAnalysisResult(data)) {
              return data;
          } else {
              console.error('Invalid data format');
              return null;
          }
      }
      // Define TypeScript interfaces for the received data
      interface NoteData {
          pitch: number;
          start_time: number;
          duration: number;
          is_chord: false;
          measure: number;
      }
      
      interface ChordData {
          pitches: number[];
          start_time: number;
          duration: number;
          is_chord: true;
          measure: number;
        root: number;
        quality: string;
      }
      
      interface Measure {
          measureNumber: number;
          notes: (NoteData | ChordData)[];
      }
      
      type AnalysisResult = Measure[];
      

      function isNoteData2(obj: any): obj is NoteData {
        return obj.is_chord === false
            
    }
    
    function isChordData2(obj: any): obj is ChordData {
        return obj.is_chord === true 
    }
      function isNoteData(obj: any): obj is NoteData {
          return typeof obj.pitch === 'number' &&
              typeof obj.start_time === 'number' &&
              typeof obj.duration === 'number' &&
              obj.is_chord === false &&
              typeof obj.measure === 'number';
      }
      
      function isChordData(obj: any): obj is ChordData {
          return Array.isArray(obj.pitches) &&
              obj.pitches.every((pitch: any) => typeof pitch === 'number') &&
              typeof obj.start_time === 'number' &&
              typeof obj.duration === 'number' &&
              obj.is_chord === true &&
              typeof obj.measure === 'number' &&
              typeof obj.root === 'number' &&
              typeof obj.quality === 'string';
      }
      
      function isMeasure(obj: any): obj is Measure {
          return typeof obj.measureNumber === 'number' &&
              Array.isArray(obj.notes) &&
              obj.notes.every((note: any) => isNoteData(note) || isChordData(note));
      }
      
      
      function countNoteAndChordData(notes: (NoteData | ChordData)[]): { noteCount: number, chordCount: number } {
          let noteCount = 0;
          let chordCount = 0;
      
          for (const note of notes) {
              if (isNoteData(note)) {
                  noteCount++;
              } else if (isChordData(note)) {
                  chordCount++;
              }
          }
      
          return { noteCount, chordCount };
      }
      
      
       function testFunction(measures: Measure[]) {
        //const [isPlaying, setIsPlaying] = useState(false)
        const { output, setOutput, onlyUseChordPrototypes, chordPrototypes, inferKey, inferMelodyKey, differentMelodyKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, minNumNotes, startOnNote, maxRestLength, useRhythm, sections, sectionOptionsPerCell, numSections, bpm} = appState
      
        function parseSections(): [Section[], Constraint<Section>[]] {
          const parsedSections = []
          const sectionConstraints = []
      
          const properlyNamedSections = sections.map(section => {
            if (section.name !== "") return section
            const sectionName = `Section${section.id}`
            return { ...section, name: sectionName }
          })
      
          for (const sectionIR of properlyNamedSections) {
            parsedSections.push(sectionIRToSection(sectionIR, chordPrototypes, onlyUseChordPrototypes))
      
            if (sectionIR.restrictPrecedingSections) {
              if (sectionIR.allowedPrecedingSections.every(sectionName => {
                if (properlyNamedSections.some(section => section.name === sectionName)) return true
                return (Chord.parseChordString(sectionName) !== undefined)
              })) {
                sectionConstraints.push(new SectionOnlyPrecededByHardConstraint(sectionIR.name, constantStringArrayGrabber(sectionIR.allowedPrecedingSections)))
              }
            }
      
            if (sectionIR.restrictFollowingSections) {
              if (sectionIR.allowedFollowingSections.every(sectionName => {
                if (properlyNamedSections.some(section => section.name === sectionName)) return true
                return (Chord.parseChordString(sectionName) !== undefined)
              })) {
                sectionConstraints.push(new SectionOnlyFollowedByHardConstraint(sectionIR.name, constantStringArrayGrabber(sectionIR.allowedFollowingSections)))
              }
            }
          }
          //console.log([parsedSections, sectionConstraints])
          return [parsedSections, sectionConstraints]
        }
      
        
          const errors = errorsInAppState(appState)
          if (errors.length > 0) {
            alert(errors.join("\n"))
            return
          }
          
          try {
           // const {parsedChordPrototypes, chordPrototypeConstraints} = parseChordPrototypes(chordPrototypes)
            const [parsedSections, sectionConstraints] = parseSections()
      
          //	console.log(numChords)
      
            
      
            const tileCanvasesChord : TileCanvas<Chordesque>[] = []
            const tileCanvasesOctavedNote: TileCanvas<OctavedNote>[] = []

            let noteIndex = 0
            let chordIndex = 0
            //console.log(notes.flat() )
            for (const measure of measures.flat()){
              //console.log("measure info" + measure)
              //console.log("measure length" + measure.notes)
              console.log(measure.measureNumber)
              let measureChordIndex = 0
              let measureNoteIndex = 0
              const noteArray = new InfiniteArray<OctavedNote[]>()
              const chordArray = new InfiniteArray<Chordesque[]>()
              for (const note of measure.notes.flat()){
               // console.log("wtf" + note.is_chord)
                
                if (isNoteData(note)){
                  
                  //console.log("note data" + note)
                  const OctavedNoteArray: OctavedNote[] = []
                  
                  const temp = OctavedNote.fromMIDIValue(note.pitch)
                  OctavedNoteArray.push(new OctavedNote(temp.getNote(), temp.getOctave(), note.measure))
                  
                  noteArray.set(measureNoteIndex, OctavedNoteArray)
                  noteIndex++;
                  measureNoteIndex++
                } 
                else if (isChordData(note)){
                 // console.log("chord data" + note)

                  const innerChordArray: Chord[] = []
                 // const parsed = parseOctavedNoteIR(note.root)
                  
                    const numbers: number[] = []
                    

                    for (const pitch of note.pitches){
                     // console.log("pitches" + note.pitches)
                      //console.log("pitch" + note.pitches[pitch])
                      
                        const temp = OctavedNote.fromMIDIValue(pitch)
                        //console.log("innerparsedNote" + OctavedNote.fromIR(innerParsed).getNote())

                        const num = noteToInt(temp.getNote())
                        numbers.push(num)
                      
                    
                    
                  }
                  const chord = new Chord(OctavedNote.fromMIDIValue(note.root).getNote(),numbers)
                    //console.log("chord" +  numbers)
                    innerChordArray.push(chord)
                    chordArray.set(measureChordIndex, innerChordArray)
                    chordIndex++
                    measureChordIndex++
                }                
                
              
                
              }
              console.log("notearray" + noteArray.entries().toString())
              const noteCanvasProps: TileCanvasProps<OctavedNote> = {
                optionsPerCell: new OptionsPerCell(OctavedNote.all(), noteArray),
                constraints: new ConstraintSet(),
              }
              
        
              const chordesqueCanvasProps: TileCanvasProps<Chordesque> = {
                optionsPerCell: new OptionsPerCell(Chord.allBasicChords(), chordArray),
                constraints: new ConstraintSet(),
              }
              const inferredKey = inferKey()
              const noteHigherValues =  {
                key: inferKey(), 
                melodyKey: differentMelodyKey ? inferMelodyKey() : inferredKey,
                bpm,
                useRhythm,
                numChords: chordIndex,
                numSections: 1,
                melodyLength,
                rhythmPatternOptions: {
                  minimumNumberOfNotes: minNumNotes,
                  onlyStartOnNote: startOnNote,
                  maximumRestLength: maxRestLength,
                },
              }
              console.log("measureChordIndex" + measureChordIndex)
              console.log("measureNoteIndex" + measureNoteIndex)
              if (measureNoteIndex > 0){
                const noteCanvas = new TileCanvas<OctavedNote>(measureNoteIndex, noteCanvasProps, noteHigherValues, new Random(), measure.measureNumber)
                tileCanvasesOctavedNote.push(noteCanvas)
              }

              if (measureChordIndex > 0){
                const chordCanvas = new TileCanvas<Chordesque>(measureChordIndex,chordesqueCanvasProps, noteHigherValues, new Random(), measure.measureNumber)
                tileCanvasesChord.push(chordCanvas)

              }
              
              

              
              //const key = new MusicalKey()
            }
      
           // console.log("noteArray" + noteArray.entries())
            //console.log("chordArray" + chordArray.entries())
            
      
            
            
      
           
      
            
      
            //let hierarchyConstraints = new ConstraintSet<Section>()
            //hierarchyConstraints.addConstraints(sectionConstraints)
            //IMPORTANT
            for (let i = 1; i <= measures.flat().length; i++){
              ConstraintTableMap.set(i, [])
              
            }
            for (const canvas of tileCanvasesOctavedNote){
              
              //console.log(canvas)
              const constraintHierarchy = new ConstraintHierarchy<OctavedNote>(canvas.getHigherValues())
              const checkedConstraints = constraintHierarchy.checkConstraintsGeneric(new ConstraintSet(noteConstraintSet.map(noteConstraint => convertIRToNoteConstraint(noteConstraint))), canvas.getTiles())
             // console.log("checked")
             
              
              
          //    console.log(ConstraintTableMap)
              
              // Iterate through the original map

                for (const constraint of checkedConstraints) {
                  updateConstraintTableMap(canvas.getMeasure(), constraint )
                  updateCountMap(constraint);
                }
                
            }

            for (const canvas of tileCanvasesChord){
              
              console.log(canvas)
              const constraintHierarchy = new ConstraintHierarchy<Chordesque>(canvas.getHigherValues())
              const checkedConstraints = constraintHierarchy.checkConstraintsGeneric(new ConstraintSet(chordConstraintSet.map(noteConstraint => convertIRToChordConstraint(noteConstraint))), canvas.getTiles())
             // console.log("checked")
             
              
              
              
              
              // Iterate through the original map

                for (const constraint of checkedConstraints) {
                  updateConstraintTableMapChord(canvas.getMeasure(), constraint )
                  updateCountMapChord(constraint);
                }
                
            }
            console.log(countMap)
            console.log(ConstraintTableMap)
          //  console.log(countMap);
          //  const constraintHierarchy2 = new ConstraintHierarchy<Chordesque>()
          
          //	console.log(constraintHierarchy.check())
            //console.log(node)
            //const generatedNotes = node.generate()
            //console.log(generatedNotes[0])
            //setOutput(generatedNotes)
          } catch (e) {
            console.error(e)
            alert(e)
          }
        
      }
      function parseNotesToTileCanvasProps(notes: (NoteData | ChordData)[]): { noteProps: TileCanvasProps<OctavedNote>[], chordProps: TileCanvasProps<Chordesque>[] } {
           
        const noteOptionsPerCell = new InfiniteArray<OctavedNote[]>();
          const noteConstraints: NoteConstraintIR[] = [];
        let chordAmount: number = 0
        let noteAmount = 0
          const chordOptionsPerCell = new InfiniteArray<Chord[]>();
          const chordConstraints: ChordConstraintIR[] = [];
      
          notes.forEach((note, index) => {
              if (note.is_chord) {
                  const chordData = note as ChordData;
            const notes_temp = chordData.pitches.map(pitch => parseOctavedNoteIR(pitch)).filter(note => note !== undefined) as OctavedNoteIR[];
            const chord = new Chord(
              parseOctavedNoteIR(chordData.pitches[0])!.note, 
              notes_temp.map(note => note.octave)
            );
            chordAmount++
            chordOptionsPerCell.set(index, [chord]);
            
              } else {
            noteAmount++
                  const noteData = note as NoteData;
                  const octavedNoteIR = parseOctavedNoteIR(noteData.pitch);
                  if (octavedNoteIR) {
                      noteOptionsPerCell.set(index, [new OctavedNote(octavedNoteIR.note, octavedNoteIR.octave)]);
                  }
              }
          });
      
          const noteProps: TileCanvasProps<OctavedNote> = {
              optionsPerCell: new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell),
              constraints: new ConstraintSet(noteConstraints.map(convertIRToNoteConstraint))
          };
      
          const chordProps: TileCanvasProps<Chordesque> = {
              optionsPerCell: new OptionsPerCell(Chord.allBasicChords(), chordOptionsPerCell),
              constraints: new ConstraintSet(chordConstraints.map(convertIRToChordConstraint))
          };
        
          return { noteProps: [noteProps].map(canvas => new TileCanvas()), chordProps: [chordProps] };
      }
      
      function parseAnalysisResultToTileCanvasProps(data: AnalysisResult): { noteProps: TileCanvasProps<OctavedNote>[], chordProps: TileCanvasProps<Chordesque>[] }[] {
          return data.map(note => parseNotesToTileCanvasProps(note.notes));
      }
      
      function inferAllConstraintsOnCanvases(noteCanvases: TileCanvas<OctavedNote>[], chordCanvases: TileCanvas<Chordesque>[]): void {
          noteCanvases.forEach(canvas => {
              const constraintHierarchy = new ConstraintHierarchy<OctavedNote>(canvas.getHigherValues());
              const constraints = canvas.getConstraints();
              const tiles = canvas.getTiles();
              console.log(constraintHierarchy.checkConstraintsGeneric(constraints, tiles));
          });
      
          chordCanvases.forEach(canvas => {
              const constraintHierarchy = new ConstraintHierarchy<Chordesque>(canvas.getHigherValues());
              const constraints = canvas.getConstraints();
              const tiles = canvas.getTiles();
              console.log(constraintHierarchy.checkConstraintsGeneric(constraints, tiles));
          }); 
      }
      
      function processMusicData(data: any) {
          // Type guard to ensure the data conforms to the AnalysisResult structure
        
          if (!isAnalysisResult(data)) {
              console.error('Invalid data format');
              return;
          }
        data.flat().forEach((measure, index) => {
              if (!measure || !measure.notes) {
                  console.error(`Measure or notes undefined at index ${index}`);
                  return;
              }
      
              //console.log(`Measure ${measure.measureNumber}:`);
      
              measure.notes.forEach((measure_data, noteIndex) => {
                  if (!measure_data) {
                      console.error(`Measure data undefined at measure ${measure.measureNumber}, note index ${noteIndex}`);
                      return;
                  }
      
                  console.log(`  Note index ${noteIndex}:`);
                  if (measure_data.is_chord) {
                      const chordData = measure_data as ChordData;
                      console.log(`    Chord: Pitches=${chordData.pitches.join(", ")}, StartTime=${chordData.start_time}, Duration=${chordData.duration}`);
                  } else {
                      const noteData = measure_data as NoteData;
                      console.log(`    Note: Pitch=${noteData.pitch}, StartTime=${noteData.start_time}, Duration=${noteData.duration}`);
                  }
              });
          });
        //console.log("foo")
        console.log(data)
          // Process the data as needed
          data.flat().forEach((measure) => {
              console.log(`Part ${measure}:`);
          //console.log(`Part ${measure.notes}:`);
      
              measure.notes.forEach((measure_data ) => {
                  console.log(`  Measure ${measure.measureNumber}:`);
            if (measure_data.is_chord) {
              const chordData = measure_data as ChordData;
              console.log(`    Chord: Pitches=${chordData.pitches.join(", ")}, StartTime=${chordData.start_time}, Duration=${chordData.duration}`);
            } else {
              const noteData = measure_data as NoteData;
              console.log(`    Note: Pitch=${noteData.pitch}, StartTime=${noteData.start_time}, Duration=${noteData.duration}`);
            }
                     
                  
              });
          });
      }
      
      const baseDuration = (bpm: number) => 60 / bpm;
      
      function MidiToNoteOutput2(midiFile: ArrayBuffer): NoteOutput[] {
        //const midi2 = new music21.MIDI.Player().loadFile("foo.mid");
        //const url = new URL("src/audio/bella ciao.xml").toString
        //const midi2 = music21.converter.parse("./src/audio/bellaciao.xml")
        //const midiData = new Uint8Array(midiFile);
         // const foo = new  music21.MIDI.noteOn(0, 60, 0);
         //const s = new music21.stream.Score().;
         analyzeMidi(midiFile).then(data => {
          testFunction(data)
      }).catch(error => {
          console.error('Failed to analyze MIDI file:', error);
      });
          const noteOutputs: NoteOutput[] = [];
          const midi: MidiFile = read(midiFile);
        //console.log(midi)
          let tempo = 500000; // default tempo (120 BPM)
          let timeSignature = { numerator: 4, denominator: 4 }; // default time signature
          const ticksPerBeat = midi.header.ticksPerBeat;
      
          // Extract tempo and time signature events
          midi.tracks.forEach(track => {
              track.forEach(event => {
                  if (event.type === "meta" && event.subtype === "setTempo") {
                      tempo = event.microsecondsPerBeat;
                  } else if (event.type === "meta" && event.subtype === "timeSignature") {
                      timeSignature = {
                          numerator: event.numerator,
                          denominator: event.denominator
                      };
                  }
              });
          });
      
          
          const ticksPerMeasure = ticksPerBeat * timeSignature.numerator * (4 / timeSignature.denominator);
      
          midi.tracks.forEach(track => {
          const activeNotes: { [key: number]: { startTime: number; deltaTime: number } } = {};
            let currentTime = 0;
              track.forEach(event => {
                  currentTime += event.deltaTime;
      
                  if (event.type == "channel" && event.subtype == "noteOn" && event.velocity > 0) {
                      // Note on event
                      const noteNumber = event.noteNumber;
                      activeNotes[noteNumber] = { startTime: currentTime, deltaTime: event.deltaTime };
                  } else if (event.type == "channel" && (event.subtype == "noteOff" || (event.subtype == "noteOn" && event.velocity === 0))) {
                      // Note off event
                      const noteNumber = event.noteNumber;
                      if (activeNotes[noteNumber]) {
                          const { startTime } = activeNotes[noteNumber];
                          const duration = currentTime - startTime;
                          const octave = Math.floor(noteNumber / 12) - 1;
                          const octavedNote = new OctavedNote(intToNote(noteNumber % 12), octave);
                          const noteOutput: NoteOutput2 = {
                              octavedNote: octavedNote,
                              startTime: startTime / (2 * ticksPerBeat),
                              duration: duration / (2 * ticksPerBeat),
                              measure: Math.floor(startTime / ticksPerMeasure)
                          };
      
                          noteOutputs.push(noteOutput);
                          delete activeNotes[noteNumber];
                      }
                  }
              });
          });
        
      
        console.log(noteOutputs)
          return noteOutputs;
      }
        const str = e.target?.result as string;
        const buff = e.target?.result as ArrayBuffer;
      //  const noteOutputs = MidiToNoteOutput(buff); // Assuming MidiToNoteOutput function is synchronous
        //const Notes = MidiToNoteOutputString(buff);
        const Notes = MidiToNoteOutput2(buff)
       // console.log(Notes2)
      //  console.log(Notes)

        newNotes = Notes;
        setOutput([Notes, Notes.length])
       
      } catch (err) {
        console.error("Error parsing MIDI:", err);
        alert("Invalid MIDI file.");
      }
    };

    reader.readAsArrayBuffer(file); // Read as ArrayBuffer instead of text
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <>
      <button onClick={handleClick}>Upload MIDI</button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".mid" 
        onChange={handleFileChange} 
      />
    </>
  );
}
interface TableRow {
  measure: string;
  [key: string]: string | number;
}
export default UploadButton;
const ConstraintTable: React.FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [columns, setColumns] = useState<Column<TableRow>[]>([]);

  const generateTable = () => {
    console.log(ConstraintTableMap)
    const constraints: string[] = Array.from(constraintSet);

    // Get all possible measures (including those with zero constraints met)
    const allMeasures = Array.from(ConstraintTableMap.keys());

    // Convert the data Map to an array of objects for react-table
    const newData: TableRow[] = allMeasures.map(measure => {
      const constraintsMet = ConstraintTableMap.get(measure) || [];
      const row: TableRow = { measure: measure.toString() };
      constraints.forEach(constraint => {
        row[constraint] = constraintsMet.includes(constraint) ? '✔️' : '❌'; // Convert checkmarks and crosses
      });
      return row;
    });

    const newColumns: Column<TableRow>[] = [
      {
        Header: 'Measure',
        accessor: 'measure'
      },
      ...constraints.map(constraint => ({
        Header: constraint,
        accessor: constraint
      }))
    ];

    setTableData(newData);
    setColumns(newColumns);
  };

  const convertToCSV = (data: TableRow[]) => {
    // Generate header row
    const header = Object.keys(data[0]).join(',') + '\n';
  
    // Generate data rows
    const csvRows = data.map(row => {
      const values = Object.keys(row).map(key => {
        if (typeof row[key] === 'string' && (row[key] === '✔️' || row[key] === '❌')) {
          return row[key] === '✔️' ? 'Yes' : 'No';
        }
        return row[key];
      });
      return values.join(',');
    }).join('\n');
  
    // Combine header and rows
    return header + csvRows;
  };
  

  const downloadCSV = () => {
    const csvContent = convertToCSV(tableData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // For other browsers
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'constraint_table.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: tableData });

  return (
    <div>
      <button onClick={generateTable}>Generate Table</button>
      <button onClick={downloadCSV} disabled={tableData.length === 0}>Download CSV</button>
      {tableData.length > 0 && (
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};




function updatePlayer() {
  const appState = useAppContext()

  const { setOutput } = appState

  setOutput([newNotes, 0])
}
export const MidiAnalyser = () => {
    const appState = useAppContext()
    const { output} = appState;  
    const [isPlaying, setIsPlaying] = useState(false);
    
    const handleDownload = () => {
       const url = URL.createObjectURL(new Blob([JSON.stringify(appState as PassiveAppState)], { type: "application/json" }))
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wfc.json';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        // Optional: Release the object URL to free up memory
        URL.revokeObjectURL(url);
    };

    return <div style={{padding:"1em", display:"flex", flexDirection:"row", gap:"1em"}}>
        <button onClick={handleDownload}>Save current MIDI</button>
        <UploadButton onUpload={MidiToNoteOutput} />
        <ConstraintBarChart/>
        <h1>Constraint Table</h1>
        <ConstraintTable />
        <MidiPlayer notes={output[0]} length={output[1]} isPlaying={isPlaying} setIsPlaying={setIsPlaying} updatePlayer={updatePlayer}/> 
        <NoteTiles />
				<NoteConstraints />
        <ChordTiles />
				<ChordConstraints />
    </div>

}