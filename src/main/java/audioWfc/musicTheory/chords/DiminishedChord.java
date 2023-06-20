package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

import java.util.Set;

public class DiminishedChord extends Chord {

    @Override
    String notation(){
        return "°";
    }

    @Override
    ChordQuality quality() {
        return ChordQuality.DIMINISHED;
    }

    @Override
    public Set<Integer> noteValues() {
        return Set.of(0,3,6);
    }

    public DiminishedChord(Note root){
        this.root = root;
        this.third = NoteUtils.relativeNote(root, 3);
        this.fifth = NoteUtils.relativeNote(root, 6);
    }
}
