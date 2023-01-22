package audioWfc.constraints;

import org.apache.commons.math3.exception.OutOfRangeException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MelodyShape {
    private List<MelodyStep> steps;

    public MelodyShape (int size){
        this.steps = Collections.nCopies(size, MelodyStep.WILDCARD);
    }

    public MelodyShape (List<MelodyStep> steps){
        this.steps = steps;
    }

    public int size(){
        return steps.size();
    }

    public void setStep(int i, MelodyStep step){
        steps.set(i, step);
    }

    public MelodyStep get(int i){
        return steps.get(i);
    }

    public static MelodyShape parse(String string){
        List<MelodyStep> steps = new ArrayList<>();
        string = string.toLowerCase();
        for (int i = 0; i < string.length(); i++) {
            char c = string.charAt(i);
            switch(c){
                case 'a' -> steps.add(MelodyStep.ASCEND);
                case 'd' -> steps.add(MelodyStep.DESCEND);
                case 's' -> steps.add(MelodyStep.STAGNATE);
                case 'w' -> steps.add(MelodyStep.WILDCARD);
                default -> throw new RuntimeException("Unsupported character passed to MelodyShape parser!");
            }
        }
        return new MelodyShape(steps);
    }
}
