package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.Note;

public class ThirdOfChordGrabber implements Grabber<Note> {
    @Override
    public Note grab(HigherValues higherValues) {
        return higherValues.getChord().getThird();
    }

    @Override
    public String configText() {
        return "Third of current chord";
    }
}
