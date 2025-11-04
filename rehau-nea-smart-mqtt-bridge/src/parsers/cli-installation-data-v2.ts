#!/usr/bin/env node
/**
 * CLI tool to parse getInstallationData API responses using Parser V2
 * 
 * Usage:
 *   npm run parseInstallationV2 -- <filename>
 *   npm run parseInstallationV2 -- <filename> --summary
 *   npm run parseInstallationV2 -- <filename> --unique <installUnique>
 */

import { InstallationDataParserV2 } from './installation-data-parser-v2';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run parseInstallationV2 -- <filename> [options]');
    console.log('');
    console.log('Arguments:');
    console.log('  <filename>        Path to JSON file containing getInstallationData response');
    console.log('');
    console.log('Options:');
    console.log('  --summary         Output human-readable summary instead of JSON');
    console.log('  --typed           Output only typed properties (exclude raw data)');
    console.log('  --unique <id>     Filter by installation unique ID');
    console.log('');
    console.log('Examples:');
    console.log('  npm run parseInstallationV2 -- installationdata.json');
    console.log('  npm run parseInstallationV2 -- installationdata.json --summary');
    console.log('  npm run parseInstallationV2 -- installationdata.json --typed');
    console.log('  npm run parseInstallationV2 -- installationdata.json --unique abc123');
    process.exit(0);
  }
  
  // Find filename (first argument that doesn't start with --)
  const filename = args.find(arg => !arg.startsWith('--'));
  if (!filename) {
    console.error('Error: No filename provided');
    console.error('Usage: npm run parseInstallationV2 -- <filename> [options]');
    process.exit(1);
  }
  
  // Check if summary mode is requested
  const summaryMode = args.includes('--summary');
  
  // Check if typed mode is requested
  const typedMode = args.includes('--typed');
  
  // Check for unique ID filter
  let targetUnique: string | undefined;
  const uniqueIndex = args.indexOf('--unique');
  if (uniqueIndex !== -1 && args[uniqueIndex + 1]) {
    targetUnique = args[uniqueIndex + 1];
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
    const parser = new InstallationDataParserV2();
    const result = parser.parseFromJson(jsonContent, targetUnique);
    
    // Output
    if (summaryMode) {
      console.log(parser.getSummary(result));
    } else if (typedMode) {
      // Output only typed properties (exclude raw)
      const output = parser.getTyped(result);
      console.log(JSON.stringify(output, null, 2));
    } else {
      // Output parsed data as JSON (without raw response)
      const output = {
        user: {
          id: result.id,
          email: result.email,
          createdAt: result.createdAt,
          language: result.language,
          roles: result.roles,
          geofencing: result.geofencing,
        },
        installs: result.installs.map(install => ({
          id: install.id,
          unique: install.unique,
          name: install.name,
          address: install.address,
          version: install.version,
          connectionState: install.connectionState,
          timezone: install.timezone,
          absenceLevel: install.absenceLevel,
          geoInstallActive: install.geoInstallActive,
          outsideTemperature: install.outsideTemperature,
          outsideTemperatureFiltered: install.outsideTemperatureFiltered,
          coolingConditions: install.coolingConditions,
          operationMode: install.operationMode,
          numberOfControllers: install.numberOfControllers,
          numberOfMixedCircuits: install.numberOfMixedCircuits,
          groups: install.groups,
          controllers: install.controllers,
          mixedCircuits: install.mixedCircuits,
          userSettings: install.userSettings,
          installerSettings: install.installerSettings,
        })),
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
