package audioWfc.musicTheory.rhythm;

public class Rest extends RhythmUnit{
    public Rest(int length){
        if(length < 1) throw new IllegalArgumentException("Length should be positive!");
        this.length = length;
    }

    @Override
    public boolean isNote() {
        return false;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder("O");
        for (int i = 0; i < length - 1; i++) {
            builder.append("o");
        }
        return builder.toString();
    }
}
