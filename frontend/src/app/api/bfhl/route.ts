import { NextResponse } from 'next/server';

const USER_ID = 'sreevarshan_15112005';
const EMAIL = 'sv1251@srmist.edu.in';
const ROLL = 'RA2311026020061';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function processData(data: unknown[]) {
  const invalid_entries: string[] = [];
  const duplicate_edges: string[] = [];

  const seenEdges = new Set<string>();
  const reportedDuplicates = new Set<string>();

  const childToParent = new Map<string, string>();
  const adjacencyList = new Map<string, string[]>();
  const allNodes = new Set<string>();

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
      adjacencyList.get(fromNode)!.push(toNode);

      allNodes.add(fromNode);
      allNodes.add(toNode);
    }
  }

  const undirectedGraph = new Map<string, string[]>();
  for (const node of allNodes) {
    undirectedGraph.set(node, []);
  }

  childToParent.forEach((parent, child) => {
    undirectedGraph.get(parent)!.push(child);
    undirectedGraph.get(child)!.push(parent);
  });

  const globalVisitedNodes = new Set<string>();
  const isolatedComponents: string[][] = [];

  for (const startNode of allNodes) {
    if (globalVisitedNodes.has(startNode)) continue;

    const currentComponent: string[] = [];
    const queue: string[] = [startNode];
    globalVisitedNodes.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift()!;
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

  const hierarchies: Array<Record<string, unknown>> = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root: string | null = null;
  let max_depth_global = -1;

  for (const component of isolatedComponents) {
    const possibleRoots = component.filter((node) => !childToParent.has(node));
    let rootNode: string;

    if (possibleRoots.length > 0) {
      possibleRoots.sort();
      rootNode = possibleRoots[0];
    } else {
      component.sort();
      rootNode = component[0];
    }

    const visitedInTree = new Set<string>();
    const recursionStack = new Set<string>();
    let hasCycle = false;
    let maxDepthTracker = 0;

    const recursivelyBuildTree = (node: string, currentDepth: number): Record<string, unknown> => {
      visitedInTree.add(node);
      recursionStack.add(node);
      maxDepthTracker = Math.max(maxDepthTracker, currentDepth);

      const subtreeObj: Record<string, unknown> = {};
      const childNodes = adjacencyList.get(node) || [];

      for (const child of childNodes) {
        if (!visitedInTree.has(child)) {
          subtreeObj[child] = recursivelyBuildTree(child, currentDepth + 1);
        } else if (recursionStack.has(child)) {
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
    } else {
      hierarchies.push({
        root: rootNode,
        tree: { [rootNode]: treeStructure },
        depth: maxDepthTracker,
      });
      total_trees++;

      if (maxDepthTracker > max_depth_global) {
        max_depth_global = maxDepthTracker;
        largest_tree_root = rootNode;
      } else if (maxDepthTracker === max_depth_global && largest_tree_root && rootNode < largest_tree_root) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers: corsHeaders });
    }

    const result = processData(data);

    return NextResponse.json({
      user_id: USER_ID,
      email_id: EMAIL,
      college_roll_number: ROLL,
      ...result,
    }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
