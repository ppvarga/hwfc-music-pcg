package audioWfc.musicTheory;

public enum Note{
    C,
    CS{
        @Override
        public String toString(){
            return "C#";
        }
    },
    D,
    DS{
        @Override
        public String toString(){
            return "D#";
        }
    },
    E,
    F,
    FS{
        @Override
        public String toString(){
            return "F#";
        }
    },
    G,
    GS{
        @Override
        public String toString(){
            return "G#";
        }
    },
    A,
    AS{
        @Override
        public String toString(){
            return "A#";
        }
    },
    B
}
