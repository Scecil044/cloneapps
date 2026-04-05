// Test script to verify phone number extraction fix
// This script tests the extractCountryCode function with various phone numbers

// Mock country codes (simplified version)
const mockCountryCodes = [
  { code: '971', iso2: 'AE', name: 'United Arab Emirates' },
  { code: '1', iso2: 'US', name: 'United States' },
  { code: '44', iso2: 'GB', name: 'United Kingdom' },
  { code: '91', iso2: 'IN', name: 'India' },
  { code: '86', iso2: 'CN', name: 'China' },
  { code: '33', iso2: 'FR', name: 'France' },
  { code: '49', iso2: 'DE', name: 'Germany' }
];

// Fixed extractCountryCode function
function extractCountryCode(phoneNumber, countryCode) {
  // Normalize phone number to ensure it starts with '+'
  if (!phoneNumber.startsWith('+')) {
    return [null, phoneNumber, null];
  }

  // Sort country codes by length descending to match the longest one first
  const sortedCodes = [...countryCode].sort((a, b) => b.code.length - a.code.length);

  for (const {code, iso2} of sortedCodes) {
    if (phoneNumber.startsWith(`+${code}`)) {
      const numberWithoutCode = phoneNumber.slice(code.length + 1); // +1 to account for the '+' symbol
      return [code, numberWithoutCode, iso2];
    }
  }

  return [null, phoneNumber, null];
}

// Test cases
const testCases = [
  '+971501234567',    // UAE number
  '+15551234567',     // US number  
  '+447911123456',    // UK number
  '+911234567890',    // India number
  '+8613912345678',   // China number
  '+33123456789',     // France number
  '+4915123456789',   // Germany number
  '971501234567',     // Without +
  '+999123456789',    // Invalid country code
  '',                 // Empty string
];

console.log('Testing phone number extraction...\n');

testCases.forEach((phoneNumber, index) => {
  const [code, number, iso2] = extractCountryCode(phoneNumber, mockCountryCodes);
  console.log(`Test ${index + 1}: ${phoneNumber}`);
  console.log(`  Country Code: ${code}`);
  console.log(`  Phone Number: ${number}`);
  console.log(`  ISO2: ${iso2}`);
  console.log('---');
});

console.log('\nExpected results:');
console.log('- UAE number should extract code "971" and number "501234567"');
console.log('- US number should extract code "1" and number "5551234567"');
console.log('- UK number should extract code "44" and number "7911123456"');
console.log('- Numbers without + should return original number with null code');
console.log('- Invalid country codes should return original number with null code');
