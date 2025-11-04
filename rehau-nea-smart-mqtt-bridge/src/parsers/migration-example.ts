/**
 * Migration Example: How to update climate-controller.ts to use Parser V2
 * 
 * This file shows the key changes needed to migrate from Parser V1 to V2.
 * DO NOT run this file - it's just an example for reference.
 */

// ============================================================================
// BEFORE (Parser V1)
// ============================================================================

/*
import { InstallationDataParser, ParsedInstallationData } from './parsers/installation-data-parser';

class ClimateControllerOld {
  async initialize() {
    // Fetch installation data
    const response = await rehauApi.getInstallationData();
    
    // Parse with V1
    const parser = new InstallationDataParser();
    const install = parser.parse(response);
    
    // Initialize installation
    this.initializeInstallation(install);
  }
  
  initializeInstallation(install: ParsedInstallationData) {
    const installId = install.unique;
    const installName = install.name;
    
    // Process groups and zones
    install.groups.forEach(group => {
      group.zones.forEach(zone => {
        // Create climate entities
        this.createZoneClimate(installId, installName, group, zone);
      });
    });
    
    // Process mixed circuits
    install.mixedCircuits.forEach(circuit => {
      this.createMixedCircuitSensors(installId, circuit);
    });
  }
}
*/

// ============================================================================
// AFTER (Parser V2)
// ============================================================================

import { InstallationDataParserV2, IUser, IInstall } from './parsers/installation-data-parser-v2';

class ClimateControllerNew {
  async initialize() {
    // Fetch installation data
    const response = await this.rehauApi.getInstallationData();
    
    // Parse with V2
    const parser = new InstallationDataParserV2();
    const userData = parser.parse(response);
    
    // Initialize all installations for this user
    userData.installs.forEach(install => {
      this.initializeInstallation(install);
    });
  }
  
  initializeInstallation(install: IInstall) {
    const installId = install.unique;
    const installName = install.name;
    
    // Create installation-level device
    this.publishInstallationDevice(install);
    
    // Process groups and zones
    install.groups.forEach(group => {
      group.zones.forEach(zone => {
        // Create climate entities
        this.createZoneClimate(installId, installName, group, zone);
        
        // NEW: Access controller reference
        if (zone.controllerRef) {
          console.log(`Zone ${zone.name} managed by controller ${zone.controllerRef}`);
        }
      });
    });
    
    // Process mixed circuits
    install.mixedCircuits.forEach(circuit => {
      this.createMixedCircuitSensors(installId, circuit);
      
      // NEW: Access digital I/O
      circuit.digitalInputs.forEach(di => {
        console.log(`Digital Input ${di.number}: ${di.state}`);
      });
      circuit.digitalOutputs.forEach(dout => {
        console.log(`Digital Output ${dout.number}: ${dout.state}`);
      });
    });
    
    // NEW: Access user settings
    if (install.userSettings) {
      console.log(`Party mode: ${install.userSettings.partyMode.active}`);
      console.log(`Temperature unit: ${install.userSettings.degreef ? 'F' : 'C'}`);
    }
    
    // NEW: Access installer settings
    if (install.installerSettings) {
      console.log(`Software version: ${install.installerSettings.softwareVersion}`);
      console.log(`Signal power: ${install.installerSettings.signalPower}`);
    }
  }
  
  // NEW: Create installation-level device in Home Assistant
  publishInstallationDevice(install: IInstall) {
    const deviceConfig = {
      identifiers: [`rehau_${install.unique}`],
      name: `REHAU ${install.name}`,
      manufacturer: 'REHAU',
      model: 'NEA SMART 2.0',
      sw_version: install.version || '1.0.0',
      suggested_area: install.name
    };
    
    // Publish installation-level sensors
    this.publishOutsideTemperatureSensor(install, deviceConfig);
    this.publishSystemModeControl(install, deviceConfig);
    this.publishConnectionStatus(install, deviceConfig);
    
    // Publish geofencing status if available
    if (install.geoInstallActive) {
      this.publishGeofencingStatus(install, deviceConfig);
    }
  }
  
  // Example: Access zone controller reference
  getZoneController(install: IInstall, zoneId: string) {
    // Find zone
    for (const group of install.groups) {
      const zone = group.zones.find(z => z.id === zoneId);
      if (zone && zone.controllerRef) {
        // Find controller
        const controller = install.controllers.find(c => c.unique === zone.controllerRef);
        return controller;
      }
    }
    return null;
  }
  
  // Placeholder methods (implement as needed)
  private rehauApi: any;
  private createZoneClimate(installId: string, installName: string, group: any, zone: any) {}
  private createMixedCircuitSensors(installId: string, circuit: any) {}
  private publishOutsideTemperatureSensor(install: IInstall, deviceConfig: any) {}
  private publishSystemModeControl(install: IInstall, deviceConfig: any) {}
  private publishConnectionStatus(install: IInstall, deviceConfig: any) {}
  private publishGeofencingStatus(install: IInstall, deviceConfig: any) {}
}

// ============================================================================
// KEY CHANGES SUMMARY
// ============================================================================

/*

1. Import Change:
   OLD: import { InstallationDataParser, ParsedInstallationData }
   NEW: import { InstallationDataParserV2, IUser, IInstall }

2. Parser Usage:
   OLD: const parser = new InstallationDataParser();
        const install = parser.parse(response);
   NEW: const parser = new InstallationDataParserV2();
        const userData = parser.parse(response);

3. Data Access:
   OLD: install.groups.forEach(...)
   NEW: userData.installs.forEach(install => {
          install.groups.forEach(...)
        });

4. New Features Available:
   - userData.email, userData.roles, userData.geofencing
   - install.userSettings (party mode, temp units, etc.)
   - install.installerSettings (software version, signal power, etc.)
   - zone.controllerRef (which controller manages this zone)
   - circuit.digitalInputs, circuit.digitalOutputs

5. Type Changes:
   OLD: ParsedInstallationData
   NEW: IInstall (for single installation)
        IUser (for user with all installations)

6. Multiple Installations:
   V2 supports multiple installations per user out of the box.
   Just iterate over userData.installs[]

7. Backwards Compatibility:
   The old parser still works! You can migrate gradually:
   - Keep using V1 in production
   - Test V2 in development
   - Switch when ready

*/

// ============================================================================
// TESTING STRATEGY
// ============================================================================

/*

1. Unit Test Both Parsers:
   npm run compareParsers -- installationdata.json
   
   Verify:
   ✓ Same number of groups, zones, channels
   ✓ Same temperature values
   ✓ Same humidity values
   ✓ Same controller/circuit counts

2. Test New Features:
   - Log user settings
   - Log installer settings
   - Verify zone controller references
   - Check digital I/O data

3. Integration Test:
   - Initialize climate controller with V2
   - Verify all HA entities created correctly
   - Test MQTT updates still work
   - Verify commands still work

4. Gradual Migration:
   - Add feature flag: USE_PARSER_V2=true/false
   - Run both parsers in parallel
   - Compare outputs
   - Switch to V2 when confident

*/

export { ClimateControllerNew };
