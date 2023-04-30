package audioWfc.wfc;

import audioWfc.wfc.constraints.concepts.Constraint;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.constraints.concepts.SoftConstraint;

import java.util.HashSet;
import java.util.Set;

public class ConstraintSet<T> {
    Set<HardConstraint<T>> hardConstraints;
    Set<SoftConstraint<T>> softConstraints;

    public ConstraintSet(Set<HardConstraint<T>> hardConstraints, Set<SoftConstraint<T>> softConstraints){
        this.hardConstraints = hardConstraints;
        this.softConstraints = softConstraints;
    }

    public ConstraintSet(){
        this.hardConstraints = new HashSet<>();
        this.softConstraints = new HashSet<>();
    }

    public ConstraintSet(Set<Constraint<T>> constraints){
        this();
        addAll(constraints);
    }

    private void addAll(Set<Constraint<T>> constraints) {
        for(Constraint<T> constraint : constraints) addConstraint(constraint);
    }

    public double weight(Tile<T> item, HigherValues higherValues){
        for(HardConstraint<T> hardConstraint : hardConstraints){
            if(!hardConstraint.check(item, higherValues)) return 0d;
        }
        double out = 1d;
        for(SoftConstraint<T> softConstraint : softConstraints){
            out += softConstraint.weight(item, higherValues);
        }
        return out;
    }

    public Set<Constraint<T>> getConstraints(){
        Set<Constraint<T>> out = new HashSet<>();
        out.addAll(hardConstraints);
        out.addAll(softConstraints);
        return out;
    }

    public void addHardConstraint(HardConstraint<T> hardConstraint){
        hardConstraints.add(hardConstraint);
    }

    public void addSoftConstraint(SoftConstraint<T> softConstraint){
        softConstraints.add(softConstraint);
    }

    public void addConstraint(Constraint<T> constraint){
        if(constraint instanceof HardConstraint<T>) addHardConstraint((HardConstraint<T>) constraint);
        else if(constraint instanceof SoftConstraint<T>) addSoftConstraint((SoftConstraint<T>) constraint);
        else throw new RuntimeException("Unknown constraint type");
    }

    public void reset(){
        this.hardConstraints = new HashSet<>();
        this.softConstraints = new HashSet<>();
    }

    public void reset(Set<Constraint<T>> constraints){
        reset();
        addAll(constraints);
    }

    public boolean removeConstraint(String name){
        Constraint<T> toRemove = null;
        boolean out = false;
        for(HardConstraint<T> hardConstraint : hardConstraints){
            if(hardConstraint.name().equals(name)) toRemove = hardConstraint;
        }
        out |= hardConstraints.remove(toRemove);
        for(SoftConstraint<T> softConstraint : softConstraints){
            if(softConstraint.name().equals(name)) toRemove = softConstraint;
        }
        out |= hardConstraints.remove(toRemove);
        return out;
    }

    public ConstraintSet<T> union(ConstraintSet<T> other){
        Set<Constraint<T>> set = new HashSet<>();
        set.addAll(this.getConstraints());
        set.addAll(other.getConstraints());
        return new ConstraintSet<>(set);
    }
}
