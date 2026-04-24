import { BfhlService } from './bfhl.service';
type BfhlRequestBody = {
    data?: unknown;
};
export declare class BfhlController {
    private readonly bfhlService;
    constructor(bfhlService: BfhlService);
    health(): {
        status: string;
        service: string;
    };
    process(body: BfhlRequestBody): {
        invalid_entries: string[];
        duplicate_edges: string[];
        hierarchies: Record<string, unknown>[];
        summary: {
            total_trees: number;
            total_cycles: number;
            largest_tree_root: string | null;
        };
        is_success: boolean;
        user_id: string;
        email_id: string;
        college_roll_number: string;
    };
}
export {};
