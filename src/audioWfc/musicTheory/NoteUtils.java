package audioWfc.musicTheory;

public class NoteUtils {
    public static Note intToNote(int value){
        switch(value % 12){
            case 0: return Note.C;
            case 1: return Note.CS;
            case 2: return Note.D;
            case 3: return Note.DS;
            case 4: return Note.E;
            case 5: return Note.F;
            case 6: return Note.FS;
            case 7: return Note.G;
            case 8: return Note.GS;
            case 9: return Note.A;
            case 10: return Note.AS;
            case 11: return Note.B;
        }
        throw new RuntimeException(Integer.toString(value));
    }

    public static int noteToInt(Note note){
        switch(note){
            case C: return 0;
            case CS: return 1;
            case D: return 2;
            case DS: return 3;
            case E: return 4;
            case F: return 5;
            case FS: return 6;
            case G: return 7;
            case GS: return 8;
            case A: return 9;
            case AS: return 10;
            case B: return 11;
        }
        throw new RuntimeException(note.toString());
    }

    public static Note relativeNote(Note root, int value){
        return intToNote(noteToInt(root) + value);
    }

    public static int distance(Note base, Note other){
        int diff = noteToInt(other) - noteToInt(base);
        if(diff>6) diff -= 12;
        if(diff<-5) diff += 12;
        return diff;
    }

    public static int absoluteDistance(Note base, Note other){
        return Math.abs(distance(base, other));
    }
}
