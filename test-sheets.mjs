import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, ".env.local");
console.log("Loading env from:", envPath);
console.log("File exists:", existsSync(envPath));

dotenv.config({ path: envPath });

console.log("\n=== Environment Variables ===");
console.log("EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✓ Set" : "✗ Missing");
console.log("KEY:", process.env.GOOGLE_PRIVATE_KEY ? "✓ Set (" + process.env.GOOGLE_PRIVATE_KEY.substring(0, 30) + "...)" : "✗ Missing");
console.log("SHEET_ID:", process.env.GOOGLE_SHEET_ID ? "✓ Set" : "✗ Missing");

async function testConnection() {
    try {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

        const auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        console.log("\n=== Connecting to Google Sheets ===");
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
        await doc.loadInfo();

        console.log("✓ Connected! Document title:", doc.title);
        console.log("✓ Available sheets:", Object.keys(doc.sheetsByTitle).join(", "));

        // Check users sheet
        const usersSheet = doc.sheetsByTitle["users"];
        if (usersSheet) {
            console.log("\n=== Users Sheet ===");
            const rows = await usersSheet.getRows();
            console.log("Total users:", rows.length);

            if (rows.length > 0) {
                console.log("\nUser list:");
                rows.forEach((row, i) => {
                    console.log(`  ${i + 1}. username: "${row.get("username")}", password: "${row.get("password")}", branch: "${row.get("branch_name")}"`);
                });
            } else {
                console.log("⚠ WARNING: No users found in the sheet!");
            }
        } else {
            console.log("\n✗ ERROR: Sheet 'users' not found!");
            console.log("  Please create a sheet named 'users' with columns: username, password, branch_id, branch_name, role");
        }

    } catch (error) {
        console.error("\n✗ Error:", error.message);
        if (error.message.includes("403")) {
            console.log("\n⚠ The service account doesn't have access to this spreadsheet.");
            console.log("  Please share the Google Sheet with:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        }
    }
}

testConnection();
