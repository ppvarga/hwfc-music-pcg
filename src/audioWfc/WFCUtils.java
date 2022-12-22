package audioWfc;

import java.util.HashSet;
import java.util.Set;

public class WFCUtils {
    public static <T> Set<NeighborPair<T>> allCombinations(Set<T> tiles){
        Set<NeighborPair<T>> out = new HashSet<>();
        for(T tile1 : tiles){
            for(T tile2 :tiles){
                out.add(new NeighborPair<>(tile1, tile2));
            }
        }
        return out;
    }

    public static <T> Set<NeighborPair<T>> allCombinationsNoRepeats(Set<T> tiles){
        Set<NeighborPair<T>> out = new HashSet<>();
        for(T tile1 : tiles){
            for(T tile2 :tiles){
                if(!tile1.equals(tile2)) out.add(new NeighborPair<>(tile1, tile2));
            }
        }
        return out;
    }
}
