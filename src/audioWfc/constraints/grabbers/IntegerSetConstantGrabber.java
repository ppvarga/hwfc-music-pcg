package audioWfc.constraints.grabbers;

import java.util.Set;

public class IntegerSetConstantGrabber implements Grabber<Set<Integer>>{
    private Set<Integer> ints;

    public IntegerSetConstantGrabber(Set<Integer> ints){
        this.ints = ints;
    }

    public Set<Integer> grab(){
        return ints;
    }
}
