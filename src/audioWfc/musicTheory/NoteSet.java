package audioWfc.musicTheory;

import java.util.Set;

public abstract class NoteSet {
    protected Note root;
    public abstract Set<Integer> noteValues();

    public Note getRoot() {
        return this.root;
    }
}
