package audioWfc.constraints;

import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.Note;

import java.util.Set;

public class NotesInKeyConstraint implements SingleConstraint<Note>{
    private Key key;

    public NotesInKeyConstraint(Key key){
        this.key = key;
    }

    @Override
    public Set<Note> allowedTiles() {
        return key.getNotes();
    }
}
