import java.util.List;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        List<Integer> example = List.of(0,0,1,2,3,3);
        WFC<Integer> wfc = new WFC<>(example);

        System.out.println(wfc.generate(List.of(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(), Optional.of(1), Optional.empty(), Optional.empty())));
    }
}
