import { NextResponse } from "next/server";
import fs from "fs/promises";
import * as fsSync from "fs";
import path from "path";
import Database from "better-sqlite3";

/**
 * GET /api/install/check-environment
 * 
 * Performs comprehensive environment checks:
 * 1. Verify CMS_DATA_PATH exists and is accessible
 * 2. Test database connectivity (Better Auth SQLite)
 * 3. Verify write permissions by creating test directory and file
 * 4. Clean up test files
 */
export async function GET() {
    const checks = {
        dataPath: { passed: false, message: "" },
        database: { passed: false, message: "" },
        writePermission: { passed: false, message: "" },
        readPermission: { passed: false, message: "" },
    };

    try {
        // Check 1: Verify CMS_DATA_PATH
        const dataPath = process.env.CMS_DATA_PATH;

        if (!dataPath) {
            checks.dataPath.message = "CMS_DATA_PATH not set in environment";
            return NextResponse.json({ checks, allPassed: false });
        }

        // Check if directory exists
        try {
            const stats = await fs.stat(dataPath);
            if (!stats.isDirectory()) {
                checks.dataPath.message = "Path exists but is not a directory";
                return NextResponse.json({ checks, allPassed: false });
            }
            checks.dataPath.passed = true;
            checks.dataPath.message = `Accessible: ${dataPath}`;
        } catch (error) {
            checks.dataPath.message = `Directory does not exist or not accessible: ${dataPath}. Error: ${error instanceof Error ? error.message : "Unknown error"}`;
            return NextResponse.json({ checks, allPassed: false });
        }

        // Check 2: Test Database Connection with Better Auth
        const dbPath = path.join(dataPath, "better-auth.db");
        try {
            // Open database
            const db = new Database(dbPath);

            // Check if Better Auth tables exist (they will be created by Better Auth on first use)
            // If database is new, it won't have tables yet - that's expected
            const tables = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('user', 'session', 'account')
            `).all() as { name: string }[];

            // Test basic database operations
            db.exec(`
                CREATE TABLE IF NOT EXISTS _install_test (
                    id INTEGER PRIMARY KEY,
                    check_time TEXT
                );
            `);

            // Test insert
            const stmt = db.prepare("INSERT INTO _install_test (check_time) VALUES (?)");
            const insertResult = stmt.run(new Date().toISOString());

            // Test read
            const readResult = db.prepare("SELECT * FROM _install_test WHERE id = ?").get(insertResult.lastInsertRowid);
            console.log("Database test read result:", readResult);
            // Clean up test table
            db.exec("DROP TABLE IF EXISTS _install_test");

            db.close();

            checks.database.passed = true;
            if (tables.length > 0) {
                checks.database.message = `Database ready with ${tables.length} Better Auth tables`;
            } else {
                checks.database.message = "Database ready (Better Auth tables will be created on first use)";
            }
        } catch (error) {
            checks.database.message = `Database error: ${error instanceof Error ? error.message : "Unknown error"}`;
            return NextResponse.json({ checks, allPassed: false });
        }

        // Check 3: Test Write Permissions
        const testDir = path.join(dataPath, "_install_test");
        const testFile = path.join(testDir, "test.txt");

        try {
            // Create test directory
            await fs.mkdir(testDir, { recursive: true });

            // Write test file
            await fs.writeFile(testFile, "Installation test write", "utf-8");

            checks.writePermission.passed = true;
            checks.writePermission.message = "Write permissions verified";
        } catch (error) {
            checks.writePermission.message = `Write failed: ${error instanceof Error ? error.message : "Unknown error"}`;
            return NextResponse.json({ checks, allPassed: false });
        }

        // Check 4: Test Read Permissions
        try {
            const content = await fs.readFile(testFile, "utf-8");

            if (content === "Installation test write") {
                checks.readPermission.passed = true;
                checks.readPermission.message = "Read permissions verified";
            } else {
                checks.readPermission.message = "Read verification failed: content mismatch";
                return NextResponse.json({ checks, allPassed: false });
            }
        } catch (error) {
            checks.readPermission.message = `Read failed: ${error instanceof Error ? error.message : "Unknown error"}`;
            return NextResponse.json({ checks, allPassed: false });
        } finally {
            // Clean up test files
            try {
                if (fsSync.existsSync(testFile)) {
                    await fs.unlink(testFile);
                }
                if (fsSync.existsSync(testDir)) {
                    await fs.rmdir(testDir);
                }
            } catch {
                // Ignore cleanup errors
            }
        }

        const allPassed = Object.values(checks).every(check => check.passed);

        return NextResponse.json({ checks, allPassed });

    } catch (error) {
        return NextResponse.json(
            {
                checks,
                allPassed: false,
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
