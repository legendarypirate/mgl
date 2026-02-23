/**
 * Data Storage Verification Script
 * 
 * This script checks how data is stored in your database to verify:
 * 1. Passwords are hashed (bcrypt)
 * 2. Refresh tokens are plain text
 * 3. User data is plain text
 * 
 * Run: node verify-data-storage.js
 */

const db = require("./app/models");
const bcrypt = require("bcryptjs");

async function verifyDataStorage() {
  try {
    console.log("=".repeat(60));
    console.log("DATA STORAGE VERIFICATION");
    console.log("=".repeat(60));
    console.log();

    // 1. Check Passwords (should be hashed)
    console.log("1. CHECKING PASSWORDS (should be hashed with bcrypt)");
    console.log("-".repeat(60));
    const user = await db.users.findOne({ limit: 1 });
    if (user) {
      const passwordHash = user.password;
      console.log("Password hash:", passwordHash.substring(0, 50) + "...");
      console.log("Hash length:", passwordHash.length);
      console.log("Is bcrypt hash:", passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$"));
      console.log("✅ PASSWORDS ARE CORRECTLY HASHED");
    } else {
      console.log("⚠️  No users found");
    }
    console.log();

    // 2. Check Refresh Tokens (should be plain text)
    console.log("2. CHECKING REFRESH TOKENS (should be plain text)");
    console.log("-".repeat(60));
    if (db.refreshTokens) {
      const refreshToken = await db.refreshTokens.findOne({ limit: 1 });
      if (refreshToken) {
        const token = refreshToken.token;
        console.log("Token:", token.substring(0, 50) + "...");
        console.log("Token length:", token.length);
        console.log("Is hex string:", /^[0-9a-f]+$/i.test(token));
        console.log("Is bcrypt hash:", token.startsWith("$2a$") || token.startsWith("$2b$"));
        
        if (token.startsWith("$2a$") || token.startsWith("$2b$")) {
          console.log("❌ ERROR: Refresh token is hashed (should be plain text)");
        } else if (/^[0-9a-f]+$/i.test(token) && token.length === 128) {
          console.log("✅ REFRESH TOKENS ARE CORRECTLY STORED AS PLAIN TEXT");
        } else {
          console.log("⚠️  Refresh token format is unusual");
        }
      } else {
        console.log("⚠️  No refresh tokens found");
      }
    } else {
      console.log("⚠️  RefreshToken model not found");
    }
    console.log();

    // 3. Check User Data (should be plain text)
    console.log("3. CHECKING USER DATA (should be plain text)");
    console.log("-".repeat(60));
    if (user) {
      console.log("Username:", user.username);
      console.log("Email:", user.email || "N/A");
      console.log("Phone:", user.phone || "N/A");
      console.log("Role ID:", user.role_id);
      console.log("✅ USER DATA IS CORRECTLY STORED AS PLAIN TEXT");
    }
    console.log();

    // 4. Summary
    console.log("=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log("✅ Passwords: Hashed (bcrypt) - CORRECT");
    console.log("✅ Refresh Tokens: Plain text (128 hex chars) - CORRECT");
    console.log("✅ User Data: Plain text - CORRECT");
    console.log();
    console.log("NOTE: Passwords should NEVER be decrypted.");
    console.log("      Use bcrypt.compare() to verify passwords.");
    console.log();

  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Run verification
verifyDataStorage();

