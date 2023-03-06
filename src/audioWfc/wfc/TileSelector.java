package audioWfc.wfc;

import audioWfc.wfc.Tile;
import org.apache.commons.math3.util.Pair;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.PriorityQueue;
import java.util.Random;
import java.util.Set;

public class TileSelector<T> {
    private PriorityQueue<Pair<Integer, Tile<T>>> pq;
    private Random random;

    public TileSelector(Random random){
        this.pq = new PriorityQueue<>(Comparator.comparing(Pair::getFirst));
        this.random = random;
    }

    public TileSelector(){
        this(new Random());
    }

    public void add(Tile<T> tile){
        pq.add(new Pair<>(tile.getNumOptions(),tile));
    }

    public Tile<T> poll(){
        boolean found = false;
        Pair<Integer,Tile<T>> pair = null;

        while(!found && !pq.isEmpty()){
            pair = pq.poll();
            if(pair.getSecond().isActive()){
                found = true;
            }
        }
        if(!found) return null;

        Set<Tile<T>> tileOptions = new HashSet<>();
        tileOptions.add(pair.getSecond());
        int numStates = pair.getFirst();

        while(!pq.isEmpty() && pq.peek().getFirst() == numStates){
            pair = pq.poll();
            if(pair.getSecond().isActive()){
                tileOptions.add(pair.getSecond());
            }
        }

        int numOptions = tileOptions.size();
        if(numOptions == 0){
            throw new RuntimeException("Collapse unsuccessful");
        }
        int randomIndex = random.nextInt(numOptions);
        Tile<T> out = new ArrayList<>(tileOptions).get(randomIndex);

        tileOptions.remove(out);

        for(Tile<T> tile : tileOptions){
            this.add(tile);
        }

        return out;
    }

}
