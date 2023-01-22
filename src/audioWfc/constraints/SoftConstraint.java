package audioWfc.constraints;

import audioWfc.Tile;

public abstract class SoftConstraint<T> implements Constraint<T>{
    protected double factor;

    public SoftConstraint(double factor){
        this.factor = factor;
    }

    public abstract double weight(Tile<T> item);
}
