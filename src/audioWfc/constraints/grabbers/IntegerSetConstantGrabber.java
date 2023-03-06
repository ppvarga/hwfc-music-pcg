package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;

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
