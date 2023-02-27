package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Note;

public class MelodyStartsOnNoteHardConstraint implements HardConstraint<OctavedNote>{
    private Note note;

    public MelodyStartsOnNoteHardConstraint(Grabber<Note> note){
        this.note = note.grab();
    }

    @Override
    public boolean check(Tile<OctavedNote> tile) {
        if(tile.getPosition() != 0) return true;
        return tile.getValue().getNote().equals(note);
    }
}
