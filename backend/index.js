const express = require('express');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// My personal details for the SRM challenge evaluation
const USER_ID = "sreevarshan_15112005";
const EMAIL = "sv1251@srmist.edu.in";
const ROLL = "RA2311026020061";

function processData(data) {
    // Arrays and sets to keep track of the challenge requirements
    const invalid_entries = [];
    const duplicate_edges = [];
    
    const seenEdges = new Set();
    const reportedDuplicates = new Set();
    
    const childToParent = new Map();
    const adjacencyList = new Map(); // using map for adjacency list representations
    const allNodes = new Set();

    data.forEach(item => {
        // Double check types before we start string manipulations
        if (typeof item !== 'string') {
            invalid_entries.push(String(item));
            return;
        }
        
        const trimmedEdge = item.trim();
        
        // Spec strictly says single uppercase letters separated by ->
        const match = trimmedEdge.match(/^([A-Z])->([A-Z])$/);
        
        if (!match) {
            invalid_entries.push(item);
            return;
        }
        
        const fromNode = match[1];
        const toNode = match[2];
        
        // Prevent self loops e.g. A->A
        if (fromNode === toNode) {
            invalid_entries.push(item);
            return;
        }

        const edgeString = `${fromNode}->${toNode}`;
        
        // Handle duplicate edge case correctly (only report it once)
        if (seenEdges.has(edgeString)) {
            if (!reportedDuplicates.has(edgeString)) {
                duplicate_edges.push(item);
                reportedDuplicates.add(edgeString);
            }
            return; // Skip adding to graph logic naturally
        }
        seenEdges.add(edgeString);

        // Keep the first parent only. If a node already has a parent, ignore any subsequent parent attempting to claim it.
        if (!childToParent.has(toNode)) {
            childToParent.set(toNode, fromNode);
            
            // Build adjacency list for tree construction later
            if (!adjacencyList.has(fromNode)) {
                adjacencyList.set(fromNode, []);
            }
            adjacencyList.get(fromNode).push(toNode);
            
            // Collect unique nodes 
            allNodes.add(fromNode);
            allNodes.add(toNode);
        }
    });

    // Grouping discrete components together as an undirected graph traversal
    const undirectedGraph = new Map();
    allNodes.forEach(node => undirectedGraph.set(node, []));
    
    childToParent.forEach((parent, child) => {
        undirectedGraph.get(parent).push(child);
        undirectedGraph.get(child).push(parent);
    });

    const globalVisitedNodes = new Set();
    const isolatedComponents = [];

    // Standard BFS to grab clustered hierarchies
    allNodes.forEach(startNode => {
        if (!globalVisitedNodes.has(startNode)) {
            const currentComponent = [];
            const queue = [startNode];
            globalVisitedNodes.add(startNode);
            
            while(queue.length > 0) {
                const current = queue.shift();
                currentComponent.push(current);
                
                for (const neighbor of undirectedGraph.get(current)) {
                    if (!globalVisitedNodes.has(neighbor)) {
                        globalVisitedNodes.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            isolatedComponents.push(currentComponent);
        }
    });

    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = null;
    let max_depth_global = -1;

    // Process each isolated cluster independently 
    isolatedComponents.forEach(component => {
        // Need to find the actual root element. Elements with no parent in this cluster are the roots.
        const possibleRoots = component.filter(node => !childToParent.has(node));
        let rootNode;
        
        if (possibleRoots.length > 0) {
            possibleRoots.sort(); // Lexicographical ordering as per spec tie breakers
            rootNode = possibleRoots[0];
        } else {
            // A pure cycle has absolutely no root naturally, so fallback to lexicographically smallest node
            component.sort();
            rootNode = component[0];
        }

        const visitedInTree = new Set();
        const recursionStack = new Set();
        let hasCycle = false;
        let maxDepthTracker = 0;

        // Recursive DFS to find cycles and compute deepest subtree simultaneously 
        function recursivelyBuildTree(node, currentDepth) {
            visitedInTree.add(node);
            recursionStack.add(node);
            
            maxDepthTracker = Math.max(maxDepthTracker, currentDepth);

            const subtreeObj = {};
            const childNodes = adjacencyList.get(node) || [];
            
            for (const child of childNodes) {
                if (!visitedInTree.has(child)) {
                    subtreeObj[child] = recursivelyBuildTree(child, currentDepth + 1);
                } else if (recursionStack.has(child)) {
                    // Back edges denote cycles!
                    hasCycle = true;
                }
            }
            
            recursionStack.delete(node); // pop from tracking stack
            return subtreeObj;
        }

        const treeStructure = recursivelyBuildTree(rootNode, 1);

        if (hasCycle) {
            hierarchies.push({
                root: rootNode,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            hierarchies.push({
                root: rootNode,
                tree: { [rootNode]: treeStructure },
                depth: maxDepthTracker
            });
            total_trees++;

            // Tracking the global largest tree for the summary response
            if (maxDepthTracker > max_depth_global) {
                max_depth_global = maxDepthTracker;
                largest_tree_root = rootNode;
            } else if (maxDepthTracker === max_depth_global && largest_tree_root) {
                if (rootNode < largest_tree_root) {
                    largest_tree_root = rootNode;
                }
            }
        }
    });

    // Formatting exactly as required
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