package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;

import java.util.Set;

public class IntegerSetConstantGrabber implements Grabber<Set<Integer>>{
    private Set<Integer> ints;

    public IntegerSetConstantGrabber(Set<Integer> ints){
        this.ints = ints;
    }

    public Set<Integer> grab(HigherValues higherValues){
        return ints;
    }
}
