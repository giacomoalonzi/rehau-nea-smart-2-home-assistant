#!/usr/bin/env node
/**
 * Compare output between Parser V1 and Parser V2
 * 
 * Usage:
 *   npm run compareParsers -- <filename>
 */

import { InstallationDataParser } from './installation-data-parser';
import { InstallationDataParserV2 } from './installation-data-parser-v2';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run compareParsers -- <filename>');
    console.log('');
    console.log('This tool compares the output of Parser V1 and Parser V2');
    console.log('to help verify the new parser produces correct results.');
    process.exit(0);
  }
  
  const filename = args[0];
  
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
    const jsonData = JSON.parse(jsonContent);
    
    console.log('='.repeat(80));
    console.log('PARSER COMPARISON');
    console.log('='.repeat(80));
    console.log('');
    
    // Parse with V1
    console.log('--- Parser V1 (Original) ---');
    const parserV1 = new InstallationDataParser();
    const resultV1 = parserV1.parse(jsonData);
    
    console.log(`Installation: ${resultV1.name} (${resultV1.unique})`);
    console.log(`Groups: ${resultV1.groups.length}`);
    console.log(`Controllers: ${resultV1.controllers.length}`);
    console.log(`Mixed Circuits: ${resultV1.mixedCircuits.length}`);
    
    let totalZonesV1 = 0;
    let totalChannelsV1 = 0;
    resultV1.groups.forEach(group => {
      totalZonesV1 += group.zones.length;
      group.zones.forEach(zone => {
        totalChannelsV1 += zone.channels.length;
      });
    });
    console.log(`Total Zones: ${totalZonesV1}`);
    console.log(`Total Channels: ${totalChannelsV1}`);
    console.log('');
    
    // Parse with V2
    console.log('--- Parser V2 (New) ---');
    const parserV2 = new InstallationDataParserV2();
    const resultV2 = parserV2.parse(jsonData);
    
    console.log(`User: ${resultV2.email} (${resultV2.id})`);
    console.log(`Installations: ${resultV2.installs.length}`);
    console.log('');
    
    resultV2.installs.forEach((install, idx) => {
      console.log(`[${idx + 1}] Installation: ${install.name} (${install.unique})`);
      console.log(`    Groups: ${install.groups.length}`);
      console.log(`    Controllers: ${install.controllers.length}`);
      console.log(`    Mixed Circuits: ${install.mixedCircuits.length}`);
      
      let totalZonesV2 = 0;
      let totalChannelsV2 = 0;
      install.groups.forEach(group => {
        totalZonesV2 += group.zones.length;
        group.zones.forEach(zone => {
          totalChannelsV2 += zone.channels.length;
        });
      });
      console.log(`    Total Zones: ${totalZonesV2}`);
      console.log(`    Total Channels: ${totalChannelsV2}`);
      
      // Additional V2 features
      if (install.userSettings) {
        console.log(`    User Settings: Available`);
        console.log(`      - Party Mode: ${install.userSettings.partyMode.active ? 'Active' : 'Inactive'}`);
      }
      if (install.installerSettings) {
        console.log(`    Installer Settings: Available`);
        console.log(`      - Software Version: ${install.installerSettings.softwareVersion}`);
        console.log(`      - Signal Power: ${install.installerSettings.signalPower}`);
      }
      console.log('');
    });
    
    // Comparison
    console.log('='.repeat(80));
    console.log('COMPARISON SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    
    const firstInstall = resultV2.installs[0];
    if (firstInstall) {
      let totalZonesV2 = 0;
      let totalChannelsV2 = 0;
      firstInstall.groups.forEach(group => {
        totalZonesV2 += group.zones.length;
        group.zones.forEach(zone => {
          totalChannelsV2 += zone.channels.length;
        });
      });
      
      console.log('✓ Installation name matches:', resultV1.name === firstInstall.name);
      console.log('✓ Groups count matches:', resultV1.groups.length === firstInstall.groups.length);
      console.log('✓ Controllers count matches:', resultV1.controllers.length === firstInstall.controllers.length);
      console.log('✓ Mixed circuits count matches:', resultV1.mixedCircuits.length === firstInstall.mixedCircuits.length);
      console.log('✓ Zones count matches:', totalZonesV1 === totalZonesV2);
      console.log('✓ Channels count matches:', totalChannelsV1 === totalChannelsV2);
      console.log('');
      
      console.log('New V2 Features:');
      console.log('  ✓ User-level data (email, roles, geofencing)');
      console.log('  ✓ Multiple installations support');
      console.log('  ✓ Zone controller references');
      console.log('  ✓ User settings (party mode, etc.)');
      console.log('  ✓ Installer settings (software version, signal power, etc.)');
      console.log('  ✓ Digital I/O in mixed circuits');
      console.log('');
    }
    
    // Detailed zone comparison
    console.log('='.repeat(80));
    console.log('DETAILED ZONE COMPARISON');
    console.log('='.repeat(80));
    console.log('');
    
    if (firstInstall) {
      resultV1.groups.forEach((groupV1, groupIdx) => {
        const groupV2 = firstInstall.groups[groupIdx];
        if (!groupV2) return;
        
        console.log(`Group: ${groupV1.name}`);
        groupV1.zones.forEach((zoneV1, zoneIdx) => {
          const zoneV2 = groupV2.zones[zoneIdx];
          if (!zoneV2) return;
          
          console.log(`  Zone ${zoneV1.number}: ${zoneV1.name}`);
          console.log(`    V1 Channels: ${zoneV1.channels.length}`);
          console.log(`    V2 Channels: ${zoneV2.channels.length}`);
          console.log(`    V2 Controller Ref: ${zoneV2.controllerRef || 'None'}`);
          
          if (zoneV1.channels[0] && zoneV2.channels[0]) {
            const ch1 = zoneV1.channels[0];
            const ch2 = zoneV2.channels[0];
            console.log(`    Current Temp: V1=${ch1.currentTemperature.celsius}°C, V2=${ch2.currentTemperature.celsius}°C`);
            console.log(`    Setpoint: V1=${ch1.setpointTemperature.celsius}°C, V2=${ch2.setpointTemperature.celsius}°C`);
            console.log(`    Humidity: V1=${ch1.humidity}%, V2=${ch2.humidity}%`);
          }
        });
        console.log('');
      });
    }
    
    console.log('='.repeat(80));
    console.log('Comparison complete!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
