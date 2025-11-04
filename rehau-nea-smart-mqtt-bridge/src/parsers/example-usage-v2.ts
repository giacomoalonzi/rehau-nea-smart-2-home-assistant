/**
 * Example usage of V2 parsers with getTyped() and getSummary() methods
 * 
 * This file demonstrates how to use the V2 parsers programmatically
 * to get either typed objects or human-readable summaries.
 */

import { InstallationDataParserV2 } from './installation-data-parser-v2';
import { UserDataParserV2 } from './user-data-parser-v2';

// ============================================================================
// Example 1: Parse Installation Data
// ============================================================================

function exampleInstallationData() {
  const apiResponse = {
    success: true,
    data: {
      user: {
        _id: 'user123',
        email: 'user@example.com',
        installs: [
          // ... installation data
        ]
      }
    }
  };

  const parser = new InstallationDataParserV2();
  
  // Parse the response (includes raw data)
  const parsed = parser.parse(apiResponse);
  
  // Option 1: Get clean typed object without raw fields
  const typed = parser.getTyped(parsed);
  console.log('Typed data:', typed);
  // typed.installs[0].groups[0].zones[0].channels[0].currentTemperature.celsius
  // No 'raw' fields anywhere in the object
  
  // Option 2: Get human-readable summary
  const summary = parser.getSummary(parsed);
  console.log('Summary:', summary);
  // User: user@example.com (user123)
  // Roles: installer, user
  // Installations: 1
  // ...
}

// ============================================================================
// Example 2: Parse User Data
// ============================================================================

function exampleUserData() {
  const apiResponse = {
    success: true,
    data: {
      user: {
        _id: 'user123',
        email: 'user@example.com',
        roles: ['user'],
        installs: [
          // ... installation info
        ]
      }
    }
  };

  const parser = new UserDataParserV2();
  
  // Parse the response (includes raw data)
  const parsed = parser.parse(apiResponse);
  
  // Option 1: Get clean typed object without raw fields
  const typed = parser.getTyped(parsed);
  console.log('Typed data:', typed);
  // typed.installations[0].programs.weeks[0].monday
  // No 'raw' fields anywhere in the object
  
  // Option 2: Get human-readable summary
  const summary = parser.getSummary(parsed);
  console.log('Summary:', summary);
  // User: user@example.com (user123)
  // Roles: user
  // Installations: 1
  // ...
}

// ============================================================================
// Example 3: Type-safe usage with TypeScript
// ============================================================================

function exampleTypeSafety() {
  const parser = new InstallationDataParserV2();
  const apiResponse = {} as any; // Your API response
  
  const parsed = parser.parse(apiResponse);
  
  // Get typed data - TypeScript knows the exact structure
  const typed = parser.getTyped(parsed);
  
  // Type-safe access to nested properties
  typed.installs.forEach(install => {
    console.log(`Installation: ${install.name}`);
    
    // TypeScript autocomplete works here
    if (install.outsideTemperature.celsius !== null) {
      console.log(`Outside temp: ${install.outsideTemperature.celsius}°C`);
    }
    
    install.groups.forEach(group => {
      group.zones.forEach(zone => {
        zone.channels.forEach(channel => {
          // All properties are properly typed
          const temp = channel.currentTemperature.celsius;
          const humidity = channel.humidity;
          console.log(`Channel ${channel.channelZone}: ${temp}°C, ${humidity}%`);
        });
      });
    });
  });
}

// ============================================================================
// Example 4: Using in an async function
// ============================================================================

async function exampleAsyncUsage() {
  // Fetch data from API
  const response = await fetch('https://api.rehau.com/getUserData');
  const json = await response.json();
  
  // Parse
  const parser = new UserDataParserV2();
  const parsed = parser.parse(json);
  
  // Get typed data for further processing
  const typed = parser.getTyped(parsed);
  
  // Process installations
  for (const install of typed.installations) {
    console.log(`Processing ${install.name}...`);
    
    // Access programs
    if (install.programs.weeks.length > 0) {
      console.log(`Has ${install.programs.weeks.length} weekly programs`);
    }
    
    // Check vacation mode
    if (install.vacation.zones.length > 0) {
      console.log(`Vacation mode active for ${install.vacation.zones.length} zones`);
    }
  }
  
  // Or get a quick summary
  console.log(parser.getSummary(parsed));
}

// ============================================================================
// Example 5: Comparing parsed vs typed
// ============================================================================

function exampleComparison() {
  const parser = new InstallationDataParserV2();
  const apiResponse = {} as any;
  
  // Parse returns data WITH raw fields
  const parsed = parser.parse(apiResponse);
  console.log('Has raw field:', 'raw' in parsed); // true
  console.log('Install has raw:', 'raw' in parsed.installs[0]); // true
  
  // getTyped returns data WITHOUT raw fields
  const typed = parser.getTyped(parsed);
  console.log('Has raw field:', 'raw' in typed); // false
  console.log('Install has raw:', 'raw' in typed.installs[0]); // false
  
  // Both have the same typed properties
  console.log('Same email:', parsed.email === typed.email); // true
  console.log('Same install name:', parsed.installs[0].name === typed.installs[0].name); // true
}

// ============================================================================
// Export examples
// ============================================================================

export {
  exampleInstallationData,
  exampleUserData,
  exampleTypeSafety,
  exampleAsyncUsage,
  exampleComparison,
};
