package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Note;

public class MelodyStartsOnNoteHardConstraint implements HardConstraint<OctavedNote>{
    private Grabber<Note> grabber;

    public MelodyStartsOnNoteHardConstraint(Grabber<Note> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> tile, HigherValues higherValues) {
        if(tile.getPosition() != 0) return true;
        return tile.getValue().getNote().equals(grabber.grab(higherValues));
    }

}
