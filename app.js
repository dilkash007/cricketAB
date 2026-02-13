/**
 * ELITE BETTING - FINAL CPANEL FIX
 * This version uses a dynamic loader to bypass the ESM error.
 */
async function boot() {
    try {
        const { register } = await import('node:module');
        const { pathToFileURL } = await import('node:url');

        // Register tsx for on-the-fly execution
        register('tsx/esm', pathToFileURL('./'));

        // Load the server
        await import('./server/server.ts');
        console.log('✅ Server is booting...');
    } catch (err) {
        console.error('FATAL_STARTUP_ERROR:', err.message);
        process.exit(1);
    }
}

boot();
