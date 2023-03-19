package audioWfc.wfc.grabbers;

import audioWfc.musicTheory.Note;
import audioWfc.wfc.HigherValues;

public class FifthOfChordGrabber implements Grabber<Note> {
    @Override
    public Note grab(HigherValues higherValues) {
        return higherValues.getChord().getFifth();
    }
}
