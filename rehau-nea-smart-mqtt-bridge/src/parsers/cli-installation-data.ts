#!/usr/bin/env node
/**
 * CLI tool to parse getInstallationData API responses
 * 
 * Usage:
 *   npm run parseInstallationData -- <filename>
 *   npm run parseInstallationData -- <filename> --summary
 *   npm run parseInstallationData -- <filename> --unique <unique-id>
 */

import { InstallationDataParser } from './installation-data-parser';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run parseInstallationData -- <filename> [options]');
    console.log('');
    console.log('Arguments:');
    console.log('  <filename>          Path to JSON file containing getInstallationData response');
    console.log('');
    console.log('Options:');
    console.log('  --summary           Output human-readable summary instead of JSON');
    console.log('  --typed             Output only typed properties (exclude raw data)');
    console.log('  --unique <id>       Parse specific installation by unique ID');
    console.log('');
    console.log('Examples:');
    console.log('  npm run parseInstallationData -- install-data.json');
    console.log('  npm run parseInstallationData -- install-data.json --summary');
    console.log('  npm run parseInstallationData -- install-data.json --typed');
    console.log('  npm run parseInstallationData -- install-data.json --unique ABC123DEF456');
    process.exit(0);
  }
  
  // Find filename (first argument that doesn't start with --)
  const filename = args.find(arg => !arg.startsWith('--'));
  if (!filename) {
    console.error('Error: No filename provided');
    console.error('Usage: npm run parseInstallationData -- <filename> [options]');
    process.exit(1);
  }
  
  // Check if summary mode is requested
  const summaryMode = args.includes('--summary');
  
  // Check if typed mode is requested
  const typedMode = args.includes('--typed');
  
  // Check if unique ID is provided
  let uniqueId: string | undefined;
  const uniqueIndex = args.indexOf('--unique');
  if (uniqueIndex !== -1 && uniqueIndex + 1 < args.length) {
    uniqueId = args[uniqueIndex + 1];
  }
  
  try {
    // Resolve file path
    const filePath = path.resolve(process.cwd(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Read file
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse
    const parser = new InstallationDataParser();
    const result = parser.parseFromJson(jsonContent, uniqueId);
    
    // Output
    if (summaryMode) {
      console.log(parser.getSummary(result));
    } else if (typedMode) {
      // Output only typed properties (exclude raw)
      const removeRaw = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj.map(removeRaw);
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            if (key !== 'raw') {
              cleaned[key] = removeRaw(obj[key]);
            }
          }
          return cleaned;
        }
        return obj;
      };
      
      const output = removeRaw({
        id: result.id,
        unique: result.unique,
        name: result.name,
        address: result.address,
        version: result.version,
        connectionState: result.connectionState,
        timezone: result.timezone,
        absenceLevel: result.absenceLevel,
        geoInstallActive: result.geoInstallActive,
        outsideTemperature: result.outsideTemperature,
        outsideTemperatureFiltered: result.outsideTemperatureFiltered,
        coolingConditions: result.coolingConditions,
        operationMode: result.operationMode,
        numberOfControllers: result.numberOfControllers,
        numberOfMixedCircuits: result.numberOfMixedCircuits,
        controllers: result.controllers,
        groups: result.groups,
        mixedCircuits: result.mixedCircuits,
      });
      console.log(JSON.stringify(output, null, 2));
    } else {
      // Output parsed data as JSON (without raw response)
      const output = {
        id: result.id,
        unique: result.unique,
        name: result.name,
        address: result.address,
        version: result.version,
        connectionState: result.connectionState,
        timezone: result.timezone,
        absenceLevel: result.absenceLevel,
        geoInstallActive: result.geoInstallActive,
        outsideTemperature: result.outsideTemperature,
        outsideTemperatureFiltered: result.outsideTemperatureFiltered,
        coolingConditions: result.coolingConditions,
        operationMode: result.operationMode,
        numberOfControllers: result.numberOfControllers,
        numberOfMixedCircuits: result.numberOfMixedCircuits,
        controllers: result.controllers,
        groups: result.groups,
        mixedCircuits: result.mixedCircuits,
      };
      console.log(JSON.stringify(output, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
