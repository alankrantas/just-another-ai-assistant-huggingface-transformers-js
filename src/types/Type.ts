export interface Input {
    text: string;
    model: string;
    task: string;
    device: string;
    dtype: string;
    parameters: {
        max_new_tokens: number;
        temperature: number;
        top_p: number;
        top_k: number;
        repetition_penalty: number;
        do_sample: boolean;
    };
}