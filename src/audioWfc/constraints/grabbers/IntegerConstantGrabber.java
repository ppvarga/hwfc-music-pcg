package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;

public class IntegerConstantGrabber implements Grabber<Integer>{
    private int n;

    public IntegerConstantGrabber(int n){
        this.n = n;
    }

    @Override
    public Integer grab(HigherValues higherValues) {
        return n;
    }
}
