package audioWfc.constraints.hierarchy;

import audioWfc.constraints.Constraint;
import audioWfc.constraints.ConstraintSet;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.chords.Chord;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class WFCTreeNode<T> {
    private WFCTreeNode<?> parent;
    private List<WFCTreeNode<?>> children;
    private Set<Object> attributes;
    private Set<ConstraintSet<?>> allConstraints;
    private ConstraintSet<T> constraintSet;
    private int size;

    public WFCTreeNode(WFCTreeNode<?> parent, Set<Object> attributes, Set<ConstraintSet<?>> allConstraints, int size){
        this.parent = parent;
        this.attributes = attributes;
        this.allConstraints = allConstraints;
        this.size = size;
        this.children = new ArrayList<>();
    }

    public void create(){
        for(ConstraintSet<?> constraintSetLoop : allConstraints){
            if(isConstraintSetOfTypeT(constraintSetLoop)){
                System.out.println("hell yea");
            }
        }
    }

    public static void main(String[] args) {
        ConstraintSet<Note> csn = new ConstraintSet<>();
        ConstraintSet<Chord> csc = new ConstraintSet<>();
        WFCTreeNode<Note> test = new WFCTreeNode<>(null, null, Set.of(csn, csc), 3);
        test.create();
    }

    public boolean isConstraintSetOfTypeT(ConstraintSet<?> constraintSet) {
        return false;
    }
}

