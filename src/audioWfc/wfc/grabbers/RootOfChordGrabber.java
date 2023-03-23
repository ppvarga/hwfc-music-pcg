package audioWfc.wfc.grabbers;

import audioWfc.musicTheory.Note;
import audioWfc.wfc.HigherValues;

public class RootOfChordGrabber implements Grabber<Note> {
    @Override
    public Note grab(HigherValues higherValues) {
        return higherValues.getChord().getRoot();
    }

    @Override
    public String configText() {
        return "Root of current chord";
    }
}
