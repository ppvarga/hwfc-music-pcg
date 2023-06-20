package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;

public class IntegerConstantGrabber implements Grabber<Integer>{
    private int n;

    public IntegerConstantGrabber(int n){
        this.n = n;
    }

    @Override
    public Integer grab(HigherValues higherValues) {
        return n;
    }

    @Override
    public String configText() {
        return String.valueOf(n);
    }
}
