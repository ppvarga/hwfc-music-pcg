package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteSet;

public abstract class Chord extends NoteSet {
    Note third;
    Note fifth;

    abstract String notation();

    @Override
    public String toString() {
        return "Chord: " + root + notation();
    }
}
