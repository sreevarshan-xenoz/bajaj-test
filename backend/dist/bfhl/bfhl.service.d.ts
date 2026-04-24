export declare class BfhlService {
    readonly userId = "sreevarshan_15112005";
    readonly email = "sv1251@srmist.edu.in";
    readonly roll = "RA2311026020061";
    processData(data: unknown[]): {
        invalid_entries: string[];
        duplicate_edges: string[];
        hierarchies: Record<string, unknown>[];
        summary: {
            total_trees: number;
            total_cycles: number;
            largest_tree_root: string | null;
        };
    };
}
