package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Note;

public class MelodyStartsOnNoteHardConstraint implements HardConstraint<Note>{
    private Note note;

    public MelodyStartsOnNoteHardConstraint(Note note){
        this.note = note;
    }

    @Override
    public boolean check(Tile<Note> tile) {
        if(tile.getPosition() != 0) return true;
        return tile.getValue().equals(note);
    }
}
