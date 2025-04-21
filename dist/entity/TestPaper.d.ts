import { Test } from "./Test";
export declare class TestPaper {
    key: number;
    paper_name: string;
    total_point: number;
    total_num: number;
    description: string;
    interviewer: string;
    candidate: string;
    time_begin: number;
    time_end: number;
    remaining_time: boolean;
    tests: Test[];
}
export default TestPaper;
