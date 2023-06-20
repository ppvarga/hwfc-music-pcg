package audioWfc.musicTheory.rhythm;

public class RhythmNote extends RhythmUnit{
    public RhythmNote(int length){
        if(length < 1) throw new IllegalArgumentException("Length should be positive!");
        this.length = length;
    }

    @Override
    public boolean isNote() {
        return true;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder("X");
        for (int i = 0; i < length - 1; i++) {
            builder.append("x");
        }
        return builder.toString();
    }

}
