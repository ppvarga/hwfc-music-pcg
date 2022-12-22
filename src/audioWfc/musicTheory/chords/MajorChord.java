package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

import java.util.Set;

public class MajorChord extends Chord {

    @Override
    String notation(){
        return "";
    }

    @Override
    public Set<Integer> noteValues() {
        return Set.of(0,4,7);
    }

    public MajorChord(Note root){
        this.root = root;
        this.third = NoteUtils.relativeNote(root, 4);
        this.fifth = NoteUtils.relativeNote(root, 7);
    }
}
