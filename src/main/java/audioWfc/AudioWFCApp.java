package audioWfc;

import audioWfc.audio.MidiPlayer;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.OptionsPerCell;
import audioWfc.wfc.constraints.concepts.Constraint;
import audioWfc.wfc.hierarchy.ChordLevelNode;
import audioWfc.wfc.hierarchy.ChordResult;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Sequencer;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static audioWfc.audio.SequencerBuilder.DEFAULT_BPM;
import static audioWfc.audio.SequencerBuilder.getSequence;

public class AudioWFCApp {

    private final ConstraintSet<OctavedNote> noteConstraints;
    private final ConstraintSet<Chordesque> chordConstraints;
    private OptionsPerCell<Chordesque> chordOptionsPerCell;
    private HigherValues higherValues;
    private final CanvasAttributes<OctavedNote> noteCanvasAttributes;
    private final CanvasAttributes<Chordesque> chordCanvasAttributes;
    private List<ChordResult> lastResult;
    private Set<String> usedConstraintTypes;
    private Set<Integer> usedChordOptionPositions;

    private Sequencer sequencer;
    private final MidiPlayer midiPlayer;


    public AudioWFCApp() {
        noteConstraints = new ConstraintSet<>();
        OptionsPerCell<OctavedNote> noteOptionsPerCell = new OptionsPerCell<>(OctavedNote.all());
        chordConstraints = new ConstraintSet<>();
        chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        higherValues = new HigherValues();
        chordCanvasAttributes = new CanvasAttributes<>(chordConstraints, chordOptionsPerCell, 0);
        noteCanvasAttributes = new CanvasAttributes<>(noteConstraints, noteOptionsPerCell, 0);
        usedConstraintTypes = new HashSet<>();
        usedChordOptionPositions = new HashSet<>();

        try {
            sequencer = MidiSystem.getSequencer();
            sequencer.open();
        } catch (MidiUnavailableException e) {
            e.printStackTrace();
        }
        sequencer.setTempoInBPM(DEFAULT_BPM);
        midiPlayer = new MidiPlayer(sequencer);
    }

    public boolean chordOptionPositionReserved(int position){
        return usedChordOptionPositions.contains(position);
    }

    public void reserveChordOptionPosition(int position){
        usedChordOptionPositions.add(position);
    }

    public void setChordOption(int position, Set<Chordesque> options){
        chordOptionsPerCell.setOptions(position, options);
    }

    public void resetOptionsPerCell(){
        chordOptionsPerCell = new OptionsPerCell<>(Chord.getAllBasicChords());
        usedChordOptionPositions = new HashSet<>();
        chordOptionsPerCell.reset();
        chordCanvasAttributes.setOptions(chordOptionsPerCell);
    }

    public boolean constraintTypeReserved(String name){
        return usedConstraintTypes.contains(name);
    }

    public void removeConstraint(Constraint constraint){
        noteConstraints.removeConstraint(constraint);
        chordConstraints.removeConstraint(constraint);
        usedConstraintTypes.remove(constraint.name());
    }

    public HigherValues getHigherValues() {
        return higherValues;
    }

    public void addNoteConstraint(Constraint<OctavedNote> constraint){
        noteConstraints.addConstraint(constraint);
    }

    public void addChordConstraint(Constraint<Chordesque> constraint){
        chordConstraints.addConstraint(constraint);
    }

    public void reserveConstraintType(String name){
        usedConstraintTypes.add(name);
    }

    public void play() throws Exception {
        if(lastResult == null){
            throw new Exception("Nothing has been generated yet");
        }
        try {
            sequencer.setSequence(getSequence(lastResult));
            midiPlayer.start();
        } catch (InvalidMidiDataException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void resetConstraints() {
        noteConstraints.reset();
        chordConstraints.reset();
        usedConstraintTypes = new HashSet<>();
    }

    private void updateCanvasAttributes(int numChords, int notesPerChord) {
        chordCanvasAttributes.setSize(numChords);
        noteCanvasAttributes.setSize(notesPerChord);
    }

    public void generate(Key key, int numChords, int notesPerChord) {
        higherValues = higherValues.copyWithKey(key);
        updateCanvasAttributes(numChords, notesPerChord);
        ChordLevelNode chordLevelNode = new ChordLevelNode(null, higherValues, chordCanvasAttributes, noteCanvasAttributes, new Random());
        List<ChordResult> result = chordLevelNode.generateWithoutRhythm();
        lastResult = result;
    }

}
