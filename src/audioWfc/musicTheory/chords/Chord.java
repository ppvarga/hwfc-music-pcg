package audioWfc.musicTheory.chords;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteSet;

public abstract class Chord extends NoteSet {
    protected Note third;
    protected Note fifth;

    abstract String notation();

    @Override
    public String toString() {
        return "Chord: " + root + notation();
    }

    public Note getThird() {
        return third;
    }

    public Note getFifth() {
        return fifth;
    }
}
