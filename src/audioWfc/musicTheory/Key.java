package audioWfc.musicTheory;

import audioWfc.musicTheory.chords.AugmentedChord;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.chords.ChordQuality;
import audioWfc.musicTheory.chords.DiminishedChord;
import audioWfc.musicTheory.chords.MajorChord;
import audioWfc.musicTheory.chords.MinorChord;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public abstract class Key extends NoteSet {
    private Set<Note> notes;
    private Set<Chord> basicChords;

    public abstract List<ChordQuality> basicChordQualities();

    public Key(Note root){
        this.root = root;
        this.notes = generateNotes();
        this.basicChords = generateBasicChords();
    }

    public Set<Note> getNotes() {
        return notes;
    }

    public Set<Chord> getBasicChords() {
        return basicChords;
    }


    private Set<Note> generateNotes(){
        Set<Note> out = new HashSet<>();
        for(int value : noteValues()){
            out.add(NoteUtils.relativeNote(root, value));
        }
        return out;
    }

    private Set<Chord> generateBasicChords(){
        Set<Chord> out = new HashSet<>();
        List<ChordQuality> qualities = basicChordQualities();
        for(int value : noteValues()){
            Note chordRoot = NoteUtils.relativeNote(root, value);
            Chord chord = null;
            boolean fail = false;
            switch (qualities.get(value)){
                case MAJOR -> chord = new MajorChord(chordRoot);
                case MINOR -> chord = new MinorChord(chordRoot);
                case DIMINISHED -> chord = new DiminishedChord(chordRoot);
                case AUGMENTED -> chord = new AugmentedChord(chordRoot);
                default -> fail = true;
            }
            if(!fail) out.add(chord);
        }
        return out;
    }
}
