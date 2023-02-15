package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.musicTheory.Note;

public class MelodyStartsOnNoteHardConstraint implements HardConstraint<OctavedNote>{
    private Note note;

    public MelodyStartsOnNoteHardConstraint(Note note){
        this.note = note;
    }

    @Override
    public boolean check(Tile<OctavedNote> tile) {
        if(tile.getPosition() != 0) return true;
        return tile.getValue().getNote().equals(note);
    }
}
