"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BfhlService = void 0;
const common_1 = require("@nestjs/common");
let BfhlService = class BfhlService {
    constructor() {
        this.userId = 'sreevarshan_15112005';
        this.email = 'sv1251@srmist.edu.in';
        this.roll = 'RA2311026020061';
    }
    processData(data) {
        const invalid_entries = [];
        const duplicate_edges = [];
        const seenEdges = new Set();
        const reportedDuplicates = new Set();
        const childToParent = new Map();
        const adjacencyList = new Map();
        const allNodes = new Set();
        for (const item of data) {
            if (typeof item !== 'string') {
                invalid_entries.push(String(item));
                continue;
            }
            const trimmedEdge = item.trim();
            const match = trimmedEdge.match(/^([A-Z])->([A-Z])$/);
            if (!match) {
                invalid_entries.push(item);
                continue;
            }
            const fromNode = match[1];
            const toNode = match[2];
            if (fromNode === toNode) {
                invalid_entries.push(item);
                continue;
            }
            const edgeString = `${fromNode}->${toNode}`;
            if (seenEdges.has(edgeString)) {
                if (!reportedDuplicates.has(edgeString)) {
                    duplicate_edges.push(item);
                    reportedDuplicates.add(edgeString);
                }
                continue;
            }
            seenEdges.add(edgeString);
            if (!childToParent.has(toNode)) {
                childToParent.set(toNode, fromNode);
                if (!adjacencyList.has(fromNode)) {
                    adjacencyList.set(fromNode, []);
                }
                adjacencyList.get(fromNode)?.push(toNode);
                allNodes.add(fromNode);
                allNodes.add(toNode);
            }
        }
        const undirectedGraph = new Map();
        for (const node of allNodes) {
            undirectedGraph.set(node, []);
        }
        childToParent.forEach((parent, child) => {
            undirectedGraph.get(parent)?.push(child);
            undirectedGraph.get(child)?.push(parent);
        });
        const globalVisitedNodes = new Set();
        const isolatedComponents = [];
        for (const startNode of allNodes) {
            if (globalVisitedNodes.has(startNode)) {
                continue;
            }
            const currentComponent = [];
            const queue = [startNode];
            globalVisitedNodes.add(startNode);
            while (queue.length > 0) {
                const current = queue.shift();
                if (!current) {
                    continue;
                }
                currentComponent.push(current);
                for (const neighbor of undirectedGraph.get(current) || []) {
                    if (!globalVisitedNodes.has(neighbor)) {
                        globalVisitedNodes.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            isolatedComponents.push(currentComponent);
        }
        const hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let largest_tree_root = null;
        let max_depth_global = -1;
        for (const component of isolatedComponents) {
            const possibleRoots = component.filter((node) => !childToParent.has(node));
            let rootNode;
            if (possibleRoots.length > 0) {
                possibleRoots.sort();
                rootNode = possibleRoots[0];
            }
            else {
                component.sort();
                rootNode = component[0];
            }
            const visitedInTree = new Set();
            const recursionStack = new Set();
            let hasCycle = false;
            let maxDepthTracker = 0;
            const recursivelyBuildTree = (node, currentDepth) => {
                visitedInTree.add(node);
                recursionStack.add(node);
                maxDepthTracker = Math.max(maxDepthTracker, currentDepth);
                const subtreeObj = {};
                const childNodes = adjacencyList.get(node) || [];
                for (const child of childNodes) {
                    if (!visitedInTree.has(child)) {
                        subtreeObj[child] = recursivelyBuildTree(child, currentDepth + 1);
                    }
                    else if (recursionStack.has(child)) {
                        hasCycle = true;
                    }
                }
                recursionStack.delete(node);
                return subtreeObj;
            };
            const treeStructure = recursivelyBuildTree(rootNode, 1);
            if (hasCycle) {
                hierarchies.push({
                    root: rootNode,
                    tree: {},
                    has_cycle: true,
                });
                total_cycles++;
            }
            else {
                hierarchies.push({
                    root: rootNode,
                    tree: { [rootNode]: treeStructure },
                    depth: maxDepthTracker,
                });
                total_trees++;
                if (maxDepthTracker > max_depth_global) {
                    max_depth_global = maxDepthTracker;
                    largest_tree_root = rootNode;
                }
                else if (maxDepthTracker === max_depth_global && largest_tree_root && rootNode < largest_tree_root) {
                    largest_tree_root = rootNode;
                }
            }
        }
        return {
            invalid_entries,
            duplicate_edges,
            hierarchies,
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root,
            },
        };
    }
};
exports.BfhlService = BfhlService;
exports.BfhlService = BfhlService = __decorate([
    (0, common_1.Injectable)()
], BfhlService);
//# sourceMappingURL=bfhl.service.js.map