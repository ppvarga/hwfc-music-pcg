package audioWfc.constraints;

public abstract class HardConstraint<T> implements Constraint<T>{
    public abstract boolean check(T tile);
}
