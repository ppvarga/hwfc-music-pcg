package audioWfc.musicTheory.rhythm;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class RhythmPattern {
    List<RhythmUnit> pattern;

    public RhythmPattern(List<RhythmUnit> pattern){
        this.pattern = pattern;
    }

    private RhythmPattern append(RhythmUnit unit){
        this.pattern.add(unit);
        return this;
    }

    public RhythmPattern copy(){
        return new RhythmPattern(new ArrayList<>(pattern));
    }

    @Override
    public String toString() {
        return pattern.stream().map(Object::toString).reduce("", String::concat);
    }

    public static void main(String[] args) {
        System.out.println(getAllForLength(8));
    }

    public List<RhythmUnit> getPattern() {
        return pattern;
    }

    public int getLength(){
        return pattern.stream().map(x -> x.length).reduce(0, Integer::sum);
    }

    public int numberOfNotes(){
        return pattern.stream().map(x -> x.isNote() ? 1 : 0).reduce(0, Integer::sum);
    }

    private boolean lastIsNote(){
        if(pattern.size() == 0) return true;
        return pattern.get(pattern.size() - 1).isNote();
    }

    private static List<List<Integer>> abstractPatternsForLength(int length){
        if(length < 0) throw new IllegalArgumentException("Pattern can't have negative length");
        List<List<Integer>> out = new ArrayList<>();
        if(length == 0) out.add(new ArrayList<>());
        for(int i = 1; i <= length; i++){
            List<List<Integer>> subResults = abstractPatternsForLength(length - i);
            for(List<Integer> subResult : subResults){
                subResult.add(i);
                out.add(subResult);
            }
        }
        return out;
    }

    public static List<RhythmPattern> getAllForLength(int length){
        List<List<Integer>> abstractPatterns = abstractPatternsForLength(length);
        List<RhythmPattern> out = new ArrayList<>();
        for(List<Integer> abstractPattern : abstractPatterns){
            out.addAll(allCombinations(abstractPattern));
        }
        return out;
    }

    public static Set<RhythmPattern> getAllForLength(int length, int minimumNumberOfNotes){
        return getAllForLength(length).stream().filter(x -> x.numberOfNotes() >= minimumNumberOfNotes).collect(Collectors.toSet());
    }

    private static Set<RhythmPattern> allCombinations(List<Integer> abstractPattern){
        return allCombinations(new RhythmPattern(new ArrayList<>()), abstractPattern);
    }

    private static Set<RhythmPattern> allCombinations(RhythmPattern prefix, List<Integer> abstractPattern){
        if(abstractPattern.size() == 0) return Set.of(prefix);
        int nextLength = abstractPattern.remove(0);
        Set<RhythmPattern> out = new HashSet<>();

        RhythmPattern prefixPlusNote = prefix.copy().append(new RhythmNote(nextLength));
        Set<RhythmPattern> allIfNote = allCombinations(prefixPlusNote, new ArrayList<>(abstractPattern));
        out.addAll(allIfNote);

        if(prefix.lastIsNote()){
            RhythmPattern prefixPlusRest = prefix.copy().append(new Rest(nextLength));
            Set<RhythmPattern> allIfRest = allCombinations(prefixPlusRest, new ArrayList<>(abstractPattern));
            out.addAll(allIfRest);
        }

        return out;
    }
}
