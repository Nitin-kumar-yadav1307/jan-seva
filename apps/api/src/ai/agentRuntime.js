import * as workerTools from './tools/workerTools.js';
import * as geoTools from './tools/geoTools.js';
import * as analyticsTools from './tools/analyticsTools.js';
import * as cooperativeTools from './tools/cooperativeTools.js';
import * as bookingTools from './tools/bookingTools.js';

const registry = {
  ...geoTools,
  ...analyticsTools,
  ...cooperativeTools,
  ...bookingTools,
  ...workerTools.workerTools
};

const definitions = [
  {
    type: 'function',
    function: {
      name: 'findNearbyWorkers',
      description: 'Find available, verified workers within a radius for a service category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          maxDistanceKm: { type: 'number', minimum: 0, maximum: 100 },
          customerCoords: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }
        },
        required: ['category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getWorkerWorkload',
      description: 'Read a worker workload and fatigue summary.',
      parameters: { type: 'object', properties: { workerId: { type: 'string' } }, required: ['workerId'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getWorkerRatings',
      description: 'Read a worker rating and completed-job summary.',
      parameters: { type: 'object', properties: { workerId: { type: 'string' } }, required: ['workerId'] }
    }
  }
];

export const getToolDefinitions = () => definitions;

export const executeTool = async (name, input = {}) => {
  const tool = registry[name];
  if (!tool) throw new Error(`Unknown AI tool: ${name}`);
  return tool(input);
};

export const getRegisteredToolNames = () => Object.keys(registry);
