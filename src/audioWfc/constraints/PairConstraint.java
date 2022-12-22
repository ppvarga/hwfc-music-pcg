package audioWfc.constraints;

import audioWfc.NeighborPair;

public interface PairConstraint<T> extends Constraint<T>{
    public abstract double weight(NeighborPair<T> pair);
}
