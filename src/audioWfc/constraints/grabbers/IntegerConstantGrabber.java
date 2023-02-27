package audioWfc.constraints.grabbers;

public class IntegerConstantGrabber implements Grabber<Integer>{
    private int n;

    public IntegerConstantGrabber(int n){
        this.n = n;
    }

    @Override
    public Integer grab() {
        return n;
    }
}
