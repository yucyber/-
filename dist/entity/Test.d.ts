import TestPaper from './TestPaper';
import { Comment } from './Comment';
export declare class Test {
    key: number;
    num: string;
    test_name: string;
    test: string;
    comments: Comment[];
    paper: TestPaper;
    answer: string;
    tags: string[];
    level: string;
    point: number;
}
export default Test;
