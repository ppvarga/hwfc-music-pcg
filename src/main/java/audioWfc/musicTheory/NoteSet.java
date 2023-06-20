package audioWfc.musicTheory;

import java.util.Objects;
import java.util.Set;

public abstract class NoteSet {
    protected Note root;
    public abstract Set<Integer> noteValues();

    public Note getRoot() {
        return this.root;
    }

    @Override
    public boolean equals(Object o){
        if(o == null) return false;
        if(this == o) return true;
        if(! (o instanceof NoteSet)) return false;
        NoteSet that = (NoteSet) o;
        return this.root.equals(that.root) &&
                this.noteValues().equals(that.noteValues());
    }

    @Override
    public int hashCode(){
        return Objects.hash(root, noteValues());
    }
}
