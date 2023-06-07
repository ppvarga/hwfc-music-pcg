package audioWfc.wfc.constraints.concepts;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;

public abstract class SoftConstraint<T> implements Constraint<T> {
    protected double factor;

    public SoftConstraint(double factor){
        this.factor = factor;
    }

    public abstract double weight(Tile<T> item, HigherValues higherValues);

    public String weightString(){
        if (factor < 0) return "";
        return Double.toString(factor);
    };
}
