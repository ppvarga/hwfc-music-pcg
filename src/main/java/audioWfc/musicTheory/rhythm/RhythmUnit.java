package audioWfc.musicTheory.rhythm;

public abstract class RhythmUnit {
    protected int length;

    public int getLength() {
        return length;
    }

    abstract public boolean isNote();

}
