package audioWfc;

import audioWfc.audio.BasicChordRealizer;
import audioWfc.audio.BasicSoundGenerator;
import audioWfc.audio.MidiPlayer;
import audioWfc.audio.PlayableNote;
import audioWfc.audio.SequencerBuilder;
import audioWfc.musicTheory.rhythm.RhythmPattern;
import audioWfc.wfc.constraints.AscendingMelodySoftConstraint;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.constraints.ChordInKeyConstraint;
import audioWfc.wfc.constraints.ChordStepSizeHardConstraint;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.constraints.concepts.MelodyShape;
import audioWfc.wfc.constraints.MelodyShapeHardConstraint;
import audioWfc.wfc.constraints.MelodyStartsOnNoteHardConstraint;
import audioWfc.wfc.constraints.MelodyAbsoluteStepSizeHardConstraint;
import audioWfc.wfc.constraints.NoteInKeyHardConstraint;
import audioWfc.wfc.constraints.NoteInOctavesConstraint;
import audioWfc.wfc.constraints.PerfectCadenceSoftConstraint;
import audioWfc.wfc.constraints.PlagalCadenceSoftConstraint;
import audioWfc.wfc.grabbers.BasicKeyGrabber;
import audioWfc.wfc.grabbers.IntegerSetConstantGrabber;
import audioWfc.wfc.grabbers.RootOfChordGrabber;
import audioWfc.wfc.grabbers.ThirdOfChordGrabber;
import audioWfc.wfc.hierarchy.ChordLevelNode;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.MajorKey;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.MajorChord;
import audioWfc.musicTheory.chords.MinorChord;
import audioWfc.wfc.OptionsPerCell;
import audioWfc.wfc.TileCanvas;
import audioWfc.wfc.hierarchy.ChordResult;
import audioWfc.wfc.hierarchy.ChordResultWithRhythm;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import javax.sound.midi.Instrument;
import javax.sound.midi.MidiChannel;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Sequencer;
import javax.sound.midi.Synthesizer;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import static audioWfc.musicTheory.Note.*;

public class Main {
    public static void main(String[] args) {
        rhythmDemo();
    }

    private static void chordPrototypeDemo() {
        ConstraintSet<Chordesque> chordConstraints = new ConstraintSet<>(Set.of(
                new ChordInKeyConstraint(new BasicKeyGrabber())
        ));

        Set<Chordesque> allChordOptions = new HashSet<>();
        allChordOptions.add(new MajorChord(C));
        allChordOptions.add(new MinorChord(E));

        ConstraintSet<OctavedNote> chordProtoFConstraints = new ConstraintSet<>(Set.of(
                new MelodyStartsOnNoteHardConstraint(new RootOfChordGrabber()),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1, 2)))
                ));
        CanvasAttributes<OctavedNote> chordProtoFAttributes = new CanvasAttributes<>(
                chordProtoFConstraints,
                new OptionsPerCell<>(OctavedNote.all()), 3);
        ChordPrototype chordProtoF = new ChordPrototype("F", new MajorChord(F), chordProtoFAttributes);

        ConstraintSet<OctavedNote> chordProtoGConstraints = new ConstraintSet<>(Set.of(
                new MelodyStartsOnNoteHardConstraint(new ThirdOfChordGrabber()),
                new AscendingMelodySoftConstraint(10)
        ));
        CanvasAttributes<OctavedNote> chordProtoGAttributes = new CanvasAttributes<>(
                chordProtoGConstraints,
                new OptionsPerCell<>(OctavedNote.all()), 5);
        ChordPrototype chordProtoG = new ChordPrototype("G", new MajorChord(G), chordProtoGAttributes);

        allChordOptions.add(chordProtoF);
        allChordOptions.add(chordProtoG);

        OptionsPerCell<Chordesque> chordOptionsPerCell = new OptionsPerCell<>(allChordOptions);

        ConstraintSet<OctavedNote> noteConstraints = new ConstraintSet<>(Set.of(
                new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5))),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1,2,3,4)))
        ));

        OptionsPerCell<OctavedNote> noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());

        HigherValues higherValues = new HigherValues();
        higherValues.setKey(new MajorKey(C));

        CanvasAttributes<Chordesque> chordCanvasAttributes =
                new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, 8);

        CanvasAttributes<OctavedNote> noteCanvasAttributes =
                new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 4);

        ChordLevelNode chordLevelNode =
                new ChordLevelNode(null, higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());

        List<ChordResult> result = chordLevelNode.generateWithoutRhythm();

        System.out.println(result);

        BasicSoundGenerator.playChords(result);
    }

    private static void chordsAndNotesCompactDemo() {
        ConstraintSet<Chordesque> chordConstraints = new ConstraintSet<>(Set.of(
                new ChordInKeyConstraint(new BasicKeyGrabber()),
                new ChordStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(3, 4, 5)))
        ));

        OptionsPerCell<Chordesque> chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        chordOptionsPerCell.setValue(2, new MajorChord(F));
        chordOptionsPerCell.setOptions(5, Set.of(new MajorChord(C), new MinorChord(E)));

        ConstraintSet<OctavedNote> noteConstraints = new ConstraintSet<>(Set.of(
                new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5))),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1,2,3))),
                new MelodyStartsOnNoteHardConstraint(new ThirdOfChordGrabber())
        ));

        OptionsPerCell<OctavedNote> noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());

        HigherValues higherValues = new HigherValues();
        higherValues.setKey(new MajorKey(C));

        CanvasAttributes<Chordesque> chordCanvasAttributes =
                new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, 8);

        CanvasAttributes<OctavedNote> noteCanvasAttributes =
                new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 4);

        ChordLevelNode chordLevelNode =
                new ChordLevelNode(null, higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());

        List<ChordResult> result = chordLevelNode.generateWithoutRhythm();

        System.out.println(result);

        BasicSoundGenerator.playChords(result);
    }

    private static void rhythmDemo() {
        ConstraintSet<Chordesque> chordConstraints = new ConstraintSet<>(Set.of(
                new ChordInKeyConstraint(new BasicKeyGrabber()),
                new ChordStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(3, 4, 5)))
        ));

        OptionsPerCell<Chordesque> chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        chordOptionsPerCell.setValue(2, new MajorChord(F));
        chordOptionsPerCell.setOptions(5, Set.of(new MajorChord(C), new MinorChord(E)));

        ConstraintSet<RhythmPattern> rhythmPatternConstraintSet = new ConstraintSet<>();
        OptionsPerCell<RhythmPattern> rhythmPatternOptionsPerCell = new OptionsPerCell<>(RhythmPattern.getAllForLength(8,3));

        ConstraintSet<OctavedNote> noteConstraints = new ConstraintSet<>(Set.of(
                new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5))),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1,2,3))),
                new MelodyStartsOnNoteHardConstraint(new ThirdOfChordGrabber())
        ));

        OptionsPerCell<OctavedNote> noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());

        HigherValues higherValues = new HigherValues();
        higherValues.setKey(new MajorKey(C));

        int chordLevelSize = 8;

        CanvasAttributes<Chordesque> chordCanvasAttributes =
                new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, chordLevelSize);

        CanvasAttributes<RhythmPattern> rhythmPatternCanvasAttributes =
                new CanvasAttributes<>(rhythmPatternConstraintSet, rhythmPatternOptionsPerCell, chordLevelSize);

        CanvasAttributes<OctavedNote> noteCanvasAttributes =
                new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 4);

        ChordLevelNode chordLevelNode =
                new ChordLevelNode(null, higherValues, chordCanvasAttributes, rhythmPatternCanvasAttributes, noteCanvasAttributes, new Random());

        List<ChordResultWithRhythm> result = chordLevelNode.generateWithRhythm();

        System.out.println(result);

        BasicSoundGenerator.playChordsWithRhythm(result);
    }

    private static void chordsAndNotesDemo() {
        Key key = new MajorKey(C);

        int chordTicks = 1;
        int noteTicks = 1;
        final int noteLength = 2;
        final int notesPerChord = 4;
        
        ConstraintSet<Chordesque> constraintSetChords = new ConstraintSet<>(Set.of(
                new ChordInKeyConstraint(new BasicKeyGrabber()),
                new ChordStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(3, 4, 5)))
        ));
        OptionsPerCell<Chordesque> optionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        optionsPerCell.setValue(2, new MajorChord(F));
        optionsPerCell.setOptions(5, Set.of(new MajorChord(C), new MinorChord(E)));

        TileCanvas<Chordesque> chordWFC = new TileCanvas<>(8, optionsPerCell, constraintSetChords);
        List<Chordesque> chords = chordWFC.generate();
        System.out.println(chords);

        Set<PlayableNote> playableNotes = new HashSet<>();

        for(Chordesque chord : chords){
            ConstraintSet<OctavedNote> constraintSetNotes = new ConstraintSet<>(Set.of(
                    new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                    new NoteInOctavesConstraint(new IntegerSetConstantGrabber(Set.of(5))),
                    new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1,2,3))),
                    new MelodyStartsOnNoteHardConstraint(null)
            ));
            TileCanvas<OctavedNote> noteWFC = new TileCanvas<>(notesPerChord, OctavedNote.all(), constraintSetNotes);
            List<OctavedNote> melodySegment = noteWFC.generate();
            System.out.println(chord + " - " + melodySegment);

            playableNotes.addAll(BasicChordRealizer.realize(chord.getValue(), chordTicks, chordTicks+ notesPerChord*noteLength));
            chordTicks += notesPerChord*noteLength;

            for(OctavedNote octavedNote : melodySegment){
                PlayableNote playableNote = new PlayableNote(octavedNote, noteTicks, noteTicks+noteLength, 100);
                playableNotes.add(playableNote);
                noteTicks += noteLength;
            }
        }

        Sequencer sequencer = SequencerBuilder.buildSequencer(playableNotes);
        MidiPlayer player = new MidiPlayer(sequencer);
        player.start();
    }

    private static void cadenceSoftConstraintsDemo(){
        Key key = new MajorKey(C);

        Set<Chordesque> chordOptions = key.getBasicChords().stream().map(x -> (Chordesque) x).collect(Collectors.toSet());

        ConstraintSet<Chordesque> constraintSetChords = new ConstraintSet<>(Set.of(
                new PerfectCadenceSoftConstraint(100d, new BasicKeyGrabber()),
                new PlagalCadenceSoftConstraint(50d, new BasicKeyGrabber())
        ));

        OptionsPerCell<Chordesque> optionsPerCell = new OptionsPerCell<>(chordOptions);
        for(int i = 0; i<8; i++){
            optionsPerCell.setValue(4*i, new MajorChord(C));
        }

        TileCanvas<Chordesque> chordWFC = new TileCanvas<>(32, optionsPerCell, constraintSetChords, new Random());

        List<Chordesque> chords = chordWFC.generate();
        System.out.println(chords);
    }

    private static void ascendingMelodyDemo() {
        Key key = new MajorKey(C);

        ConstraintSet<OctavedNote> constraintSetNotes = new ConstraintSet<>(Set.of(
                new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(1,2,3,4))),
                new AscendingMelodySoftConstraint(10)
        ));
        TileCanvas<OctavedNote> noteWFC = new TileCanvas<>(16, OctavedNote.all(), constraintSetNotes, new Random());
        List<OctavedNote> melodySegment = noteWFC.generate();
        System.out.println(melodySegment);
    }

    private static void melodyShapeDemo() {
        Key key = new MajorKey(C);

        String melodyShapeString = "adadadadda";
        MelodyShape melodyShape = MelodyShape.parse(melodyShapeString);

        ConstraintSet<OctavedNote> constraintSetNotes = new ConstraintSet<>(Set.of(
                new NoteInKeyHardConstraint(new BasicKeyGrabber()),
                new MelodyAbsoluteStepSizeHardConstraint(new IntegerSetConstantGrabber(Set.of(0,1,2,3))),
                new MelodyShapeHardConstraint(null) //TODO
        ));
        TileCanvas<OctavedNote> noteWFC = new TileCanvas<>(melodyShapeString.length()+1, OctavedNote.all(), constraintSetNotes, new Random());
        List<OctavedNote> melodySegment = noteWFC.generate();
        System.out.println(melodySegment);
    }

    private static void playOneNote() { // https://stackoverflow.com/a/36466737
        try{
            /* Create a new Sythesizer and open it. Most of
             * the methods you will want to use to expand on this
             * example can be found in the Java documentation here:
             * https://docs.oracle.com/javase/7/docs/api/javax/sound/midi/Synthesizer.html
             */
            Synthesizer midiSynth = MidiSystem.getSynthesizer();
            midiSynth.open();

            //get and load default instrument and channel lists
            Instrument[] instr = midiSynth.getDefaultSoundbank().getInstruments();
            MidiChannel[] mChannels = midiSynth.getChannels();

            midiSynth.loadInstrument(instr[0]);//load an instrument


            mChannels[0].noteOn(60, 100);//On channel 0, play note number 60 with velocity 100
            try { Thread.sleep(1000); // wait time in milliseconds to control duration
            } catch( InterruptedException e ) {
                e.printStackTrace();
            }
            mChannels[0].noteOff(60);//turn of the note


        } catch (MidiUnavailableException e) {
            e.printStackTrace();
        }
    }
}
