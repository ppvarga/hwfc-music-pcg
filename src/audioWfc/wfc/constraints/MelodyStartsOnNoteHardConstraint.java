package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.musicTheory.Note;

public class MelodyStartsOnNoteHardConstraint implements HardConstraint<OctavedNote> {
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
