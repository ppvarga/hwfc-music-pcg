package audioWfc.constraints;

import audioWfc.NeighborPair;

public abstract class PairConstraint<T> extends Constraint<T>{
    public abstract double weight(NeighborPair<T> pair);
}
