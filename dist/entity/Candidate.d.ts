export default class Candidate {
    id: number;
    email: string;
    paper: string;
    test_name: string;
    test_level: string;
    test_status: string;
    tags: string[];
    program_answer: string;
    program_language: string;
    submit_num: number;
    score: number;
    answer_begin: number;
    answer_end: number;
    time_end: number;
    watch: boolean;
}
