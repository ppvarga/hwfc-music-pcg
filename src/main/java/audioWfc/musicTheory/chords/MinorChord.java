package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

import java.util.Set;

public class MinorChord extends Chord {

    @Override
    String notation(){
        return "m";
    }

    @Override
    ChordQuality quality() {
        return ChordQuality.MINOR;
    }

    @Override
    public Set<Integer> noteValues() {
        return Set.of(0,3,7);
    }


    public MinorChord(Note root){
        this.root = root;
        this.third = NoteUtils.relativeNote(root, 3);
        this.fifth = NoteUtils.relativeNote(root, 7);
    }
}
