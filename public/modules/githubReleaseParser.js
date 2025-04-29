const axios = require('axios');
const path = require('path');
const getDownloadTimestamps = require('./downloadTimestamps');

/**
 * Utility functions for checking updates via releases.drivechain.info and GitHub releases
 */

/**
 * Fetches the latest release from GitHub
 * @param {Object} github The GitHub configuration object
 * @returns {Promise<Object>} The latest release information
 */
async function fetchLatestGithubRelease(github) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${github.owner}/${github.repo}/releases/latest`
        );
        
        const release = response.data;
        const version = release.tag_name.replace(/^v/, '');
        const assets = {};

        // Match assets to platform patterns
        for (const [platform, pattern] of Object.entries(github.asset_patterns)) {
            if (!pattern) continue;
            
            const regex = new RegExp(pattern);
            const asset = release.assets.find(a => regex.test(a.name));
            
            if (asset) {
                assets[platform] = {
                    download_url: asset.browser_download_url,
                    filename: asset.name,
                    size: asset.size
                };
            }
        }

        return {
            version,
            assets,
            published_at: release.published_at
        };
    } catch (error) {
        console.error('Failed to fetch GitHub release:', error);
        throw error;
    }
}

/**
 * Compares version strings (e.g., v1.9.1 vs v1.9.2)
 * @param {string} version1 First version string
 * @param {string} version2 Second version string
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1, version2) {
    // Remove 'v' prefix if present
    const v1 = version1.replace(/^v/, '').split('.').map(Number);
    const v2 = version2.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;
        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
    }
    return 0;
}

/**
 * Gets the latest version from releases.drivechain.info
 * @param {string} url The download URL
 * @returns {Promise<string|null>} The latest version or null if not found
 */
async function getLatestVersion(url) {
    try {
        // Make a HEAD request to check if the URL exists and get any version info
        const response = await axios.head(url);
        
        // Check if the server provides a version header
        const version = response.headers['x-latest-version'];
        if (version) {
            return version;
        }

        // If no version header, try to extract from URL
        const versionMatch = url.match(/v?(\d+\.\d+\.\d+)/);
        if (versionMatch) {
            return versionMatch[1];
        }

        return null;
    } catch (error) {
        console.error(`Failed to get latest version from ${url}:`, error);
        return null;
    }
}

/**
 * Fetches update information for all components
 * @param {Object} chainConfig The chain configuration object
 * @param {Object} chainManager The chain manager instance
 * @returns {Promise<Object>} Update information for all components
 * @throws {Error} If the fetch fails
 */
async function fetchGithubReleases(chainConfig, chainManager) {
    try {
        const updates = {};

        // Get status of all chains
        const chainStatuses = {};
        for (const chain of chainConfig.chains) {
            try {
                const status = await chainManager.getChainStatus(chain.id);
                chainStatuses[chain.id] = status;
            } catch (error) {
                console.error(`Failed to get status for ${chain.id}:`, error);
                chainStatuses[chain.id] = 'error';
            }
        }

        // Only check enabled chains that are downloaded
        const downloadedChains = chainConfig.chains.filter(chain => 
            chain.enabled && 
            chainStatuses[chain.id] && 
            chainStatuses[chain.id] !== 'not_downloaded'
        );

        // Check each downloaded chain for updates
        for (const chain of downloadedChains) {
            try {
                let latestVersion;
                let platforms;

                // Handle GitHub releases differently
                if (chain.github?.use_github_releases) {
                    const release = await fetchLatestGithubRelease(chain.github);
                    // Reload timestamps before checking to ensure we have latest state
                    const timestamps = getDownloadTimestamps();
                    timestamps.loadTimestamps(); // Force reload from disk
                    const localTimestamp = timestamps.getTimestamp(chain.id);
                    
                    // If no local timestamp or release is newer than our timestamp
                    const hasUpdate = !localTimestamp || new Date(release.published_at) > new Date(localTimestamp);
                    
                    platforms = {};
                    for (const platform of ['linux', 'darwin', 'win32']) {
                        const asset = release.assets[platform];
                        if (asset) {
                            platforms[platform] = {
                                filename: asset.filename,
                                download_url: asset.download_url,
                                size: asset.size,
                                found: true
                            };
                        } else {
                            platforms[platform] = {
                                found: false
                            };
                        }
                    }

                    updates[chain.id] = {
                        displayName: chain.display_name,
                        has_update: hasUpdate,
                        platforms
                    };
                    
                    // Skip the version comparison since we're using timestamps
                    continue;
                } else {
                    // Traditional releases.drivechain.info approach
                    // Get current version from binary path if available
                    let currentVersion = chain.version;
                    if (!currentVersion && chain.binary[process.platform]) {
                        const binaryPath = chain.binary[process.platform];
                        const versionMatch = binaryPath.match(/\d+\.\d+\.\d+/);
                        if (versionMatch) {
                            currentVersion = versionMatch[0];
                        }
                    }

                    // If we can't determine current version, skip this chain
                    if (!currentVersion) {
                        continue;
                    }

                    latestVersion = await getLatestVersion(chain.download.urls[process.platform]);
                    if (!latestVersion) continue;

                    platforms = {
                        linux: {
                            filename: path.basename(chain.download.urls.linux),
                            download_url: chain.download.urls.linux,
                            size: chain.download.sizes.linux || null,
                            found: true
                        },
                        darwin: {
                            filename: path.basename(chain.download.urls.darwin),
                            download_url: chain.download.urls.darwin,
                            size: chain.download.sizes.darwin || null,
                            found: true
                        },
                        win32: {
                            filename: path.basename(chain.download.urls.win32),
                            download_url: chain.download.urls.win32,
                            size: chain.download.sizes.win32 || null,
                            found: true
                        }
                    };

                    // Compare versions to check for update
                    const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;

                    updates[chain.id] = {
                        displayName: chain.display_name,
                        current_version: currentVersion,
                        latest_version: latestVersion,
                        has_update: hasUpdate,
                        platforms
                    };
                }
            } catch (error) {
                console.error(`Failed to check updates for ${chain.id}:`, error);
                // Skip this chain if there's an error
                continue;
            }
        }

        return updates;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Connection timed out while checking for updates');
        }
        if (error.response) {
            throw new Error(`Failed to check for updates: ${error.response.status} ${error.response.statusText}`);
        }
        throw new Error(`Failed to check for updates: ${error.message}`);
    }
}

module.exports = {
    fetchGithubReleases,
    compareVersions
};
