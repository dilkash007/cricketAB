/**
 * ELITE BETTING - CPANEL ESM WRAPPER
 * This file uses CommonJS to satisfy the cPanel runner
 * while loading the main TypeScript/ESM application.
 */

try {
    // Register 'tsx' to handle TypeScript files on the fly
    require('tsx/register');

    // Dynamically import the ESM server
    // Note: We use dynamic import() which is allowed in CJS
    import('./server/server.ts').catch(err => {
        console.error('SERVER_BOOT_ERROR:', err);
        process.exit(1);
    });
} catch (e) {
    console.error('WRAPPER_FATAL_ERROR:', e.message);
    process.exit(1);
}
