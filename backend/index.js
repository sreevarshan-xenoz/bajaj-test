const express = require('express');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend folder directly at localhost:3000
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;

// REPLACE THESE WITH YOUR ACTUAL DETAILS
const USER_ID = "sreevarshan_15112000"; // Update the date of birth if 15112000 is incorrect!
const EMAIL = "sreevarshan1511@gmail.com";
const ROLL = "RA2311026020061";

function processData(data) {
    const invalid_entries = [];
    const duplicate_edges = [];
    const seenEdges = new Set();
    const reportedDuplicates = new Set();
    const childToParent = new Map();
    const adj = new Map();
    const allNodes = new Set();

    data.forEach(item => {
        if (typeof item !== 'string') {
            invalid_entries.push(String(item));
            return;
        }
        const trimmed = item.trim();
        const match = trimmed.match(/^([A-Z])->([A-Z])$/);
        if (!match) {
            invalid_entries.push(item);
            return;
        }
        
        const u = match[1];
        const v = match[2];
        
        if (u === v) { // self-loop
            invalid_entries.push(item);
            return;
        }

        const edgeStr = `${u}->${v}`;
        if (seenEdges.has(edgeStr)) {
            if (!reportedDuplicates.has(edgeStr)) {
                duplicate_edges.push(item);
                reportedDuplicates.add(edgeStr);
            }
            return;
        }
        seenEdges.add(edgeStr);

        // Multi-parent diamond handling: first encountered parent wins
        if (!childToParent.has(v)) {
            childToParent.set(v, u);
            if (!adj.has(u)) adj.set(u, []);
            adj.get(u).push(v);
            
            allNodes.add(u);
            allNodes.add(v);
        }
        // Note: if it has a parent, it's ignored for graph building (already handled)
    });

    // Determine connected components treating graph as undirected
    const undirectedAdj = new Map();
    allNodes.forEach(n => undirectedAdj.set(n, []));
    childToParent.forEach((parent, child) => {
        undirectedAdj.get(parent).push(child);
        undirectedAdj.get(child).push(parent);
    });

    const visitedGlobal = new Set();
    const components = [];

    allNodes.forEach(start => {
        if (!visitedGlobal.has(start)) {
            const compNodes = [];
            const q = [start];
            visitedGlobal.add(start);
            while(q.length > 0) {
                const curr = q.shift();
                compNodes.push(curr);
                for (const neighbor of undirectedAdj.get(curr)) {
                    if (!visitedGlobal.has(neighbor)) {
                        visitedGlobal.add(neighbor);
                        q.push(neighbor);
                    }
                }
            }
            components.push(compNodes);
        }
    });

    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = null;
    let max_depth_global = -1;

    components.forEach(comp => {
        let possibleRoots = comp.filter(n => !childToParent.has(n));
        let root;
        if (possibleRoots.length > 0) {
            possibleRoots.sort(); 
            root = possibleRoots[0];
        } else {
            comp.sort();
            root = comp[0];
        }

        const visited = new Set();
        const recStack = new Set();
        let has_cycle = false;
        let max_depth = 0;

        function buildTree(node, depth) {
            visited.add(node);
            recStack.add(node);
            max_depth = Math.max(max_depth, depth);

            const subtree = {};
            const children = adj.get(node) || [];
            for (const child of children) {
                if (!visited.has(child)) {
                    subtree[child] = buildTree(child, depth + 1);
                } else if (recStack.has(child)) {
                    has_cycle = true;
                }
            }
            recStack.delete(node);
            return subtree;
        }

        const treeStr = buildTree(root, 1);

        if (has_cycle) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            hierarchies.push({
                root,
                tree: { [root]: treeStr },
                depth: max_depth
            });
            total_trees++;

            if (max_depth > max_depth_global) {
                max_depth_global = max_depth;
                largest_tree_root = root;
            } else if (max_depth === max_depth_global && largest_tree_root) {
                if (root < largest_tree_root) largest_tree_root = root;
            }
        }
    });

    return {
        invalid_entries,
        duplicate_edges,
        hierarchies,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };
}

app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ is_success: false, error: "Invalid input" });
        }

        const result = processData(data);

        res.json({
            is_success: true,
            user_id: USER_ID,
            email_id: EMAIL,
            college_roll_number: ROLL,
            ...result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ is_success: false, error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});