package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;
import audioWfc.musicTheory.Note;

public class ThirdOfChordGrabber implements Grabber<Note> {
    @Override
    public Note grab(HigherValues higherValues) {
        return higherValues.getChord().getThird();
    }
}
