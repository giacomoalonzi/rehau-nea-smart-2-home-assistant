#!/usr/bin/env node
/**
 * CLI tool to parse getUserData API responses using Parser V2
 * 
 * Usage:
 *   npm run parseUserDataV2 -- <filename>
 *   npm run parseUserDataV2 -- <filename> --summary
 *   npm run parseUserDataV2 -- <filename> --typed
 */

import { UserDataParserV2 } from './user-data-parser-v2';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run parseUserDataV2 -- <filename> [options]');
    console.log('');
    console.log('Arguments:');
    console.log('  <filename>        Path to JSON file containing getUserData response');
    console.log('');
    console.log('Options:');
    console.log('  --summary         Output human-readable summary instead of JSON');
    console.log('  --typed           Output only typed properties (exclude raw data)');
    console.log('');
    console.log('Examples:');
    console.log('  npm run parseUserDataV2 -- userdata.json');
    console.log('  npm run parseUserDataV2 -- userdata.json --summary');
    console.log('  npm run parseUserDataV2 -- userdata.json --typed');
    process.exit(0);
  }
  
  // Find filename (first argument that doesn't start with --)
  const filename = args.find(arg => !arg.startsWith('--'));
  if (!filename) {
    console.error('Error: No filename provided');
    console.error('Usage: npm run parseUserDataV2 -- <filename> [options]');
    process.exit(1);
  }
  
  // Check if summary mode is requested
  const summaryMode = args.includes('--summary');
  
  // Check if typed mode is requested
  const typedMode = args.includes('--typed');
  
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
    const parser = new UserDataParserV2();
    const result = parser.parseFromJson(jsonContent);
    
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
        id: result.id,
        email: result.email,
        createdAt: result.createdAt,
        language: result.language,
        roles: result.roles,
        geofencing: result.geofencing,
        installations: result.installations,
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
