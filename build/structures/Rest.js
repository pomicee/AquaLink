"use strict";
const https = require("https");
const http = require("http");

let http2;
try {
    http2 = require("http2");
} catch (e) {
}

class Rest {
    constructor(aqua, { secure, host, port, sessionId, password, timeout = 30000 }) {
        this.aqua = aqua;
        this.sessionId = sessionId;
        this.version = "v4";
        this.baseUrl = `${secure ? "https" : "http"}://${host}:${port}`;
        this.headers = {
            "Content-Type": "application/json",
            "Authorization": password,
        };
        this.secure = secure;
        this.timeout = timeout;
        
        this.client = this.initializeClient();
    }

    initializeClient() {
        if (this.secure) {
            return http2 || https;
        }
        return http;
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }

    async makeRequest(method, endpoint, body = null) {
        const options = {
            method,
            headers: this.headers,
        };

        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${endpoint}`;
            const req = this.client.request(url, options, (res) => {
                res.setEncoding('utf8');
                
                let data = '';
                
                res.on("data", (chunk) => {
                    data += chunk;
                });
                
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        if (!data) {
                            resolve(null);
                            return;
                        }
                        
                        try {
                            resolve(data ? JSON.parse(data) : null);
                        } catch (error) {
                            reject(new Error(`Failed to parse response: ${error.message}`));
                        }
                    } else {
                        reject(new Error(`Request failed with status ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });

            req.on("error", (error) => reject(new Error(`Request failed (${method} ${url}): ${error.message}`)));

            if (body) {
                const jsonBody = JSON.stringify(body);
                req.write(jsonBody);
            }
            req.end();
        });
    }

    validateSessionId() {
        if (!this.sessionId) throw new Error("Session ID is not set.");
    }

    async updatePlayer({ guildId, data }) {
        if (data.track?.encoded && data.track?.identifier) {
            throw new Error("Cannot provide both 'encoded' and 'identifier' for track");
        }
        this.validateSessionId();
        return this.makeRequest(
            "PATCH", 
            `/${this.version}/sessions/${this.sessionId}/players/${guildId}?noReplace=false`, 
            data
        );
    }

    getPlayers() {
        this.validateSessionId();
        return this.makeRequest("GET", `/${this.version}/sessions/${this.sessionId}/players`);
    }

    destroyPlayer(guildId) {
        this.validateSessionId();
        return this.makeRequest("DELETE", `/${this.version}/sessions/${this.sessionId}/players/${guildId}`);
    }

    getTracks(identifier) {
        return this.makeRequest("GET", `/${this.version}/loadtracks?identifier=${encodeURIComponent(identifier)}`);
    }

    decodeTrack(track) {
        return this.makeRequest("GET", `/${this.version}/decodetrack?encodedTrack=${encodeURIComponent(track)}`);
    }

    decodeTracks(tracks) {
        return this.makeRequest("POST", `/${this.version}/decodetracks`, tracks);
    }

    getStats() {
        return this.makeRequest("GET", `/${this.version}/stats`);
    }

    getInfo() {
        return this.makeRequest("GET", `/${this.version}/info`);
    }

    getRoutePlannerStatus() {
        return this.makeRequest("GET", `/${this.version}/routeplanner/status`);
    }

    getRoutePlannerAddress(address) {
        return this.makeRequest("POST", `/${this.version}/routeplanner/free/address`, { address });
    }

    async getLyrics({ track }) {
        if (!track) return null;
        
        try {
            if (track.search) {
                const query = track.info.title;
                try {
                    const res = await this.makeRequest("GET", `/${this.version}/lyrics/search?query=${query}&source=genius`);
                    if (res) return res;
                } catch (err) {}
            } else {
                this.validateSessionId();
                return await this.makeRequest(
                    "GET", 
                    `/${this.version}/sessions/${this.sessionId}/players/${track.guild_id}/track/lyrics?skipTrackSource=false`
                );
            }
         
        } catch (error) {
            console.error("Failed to fetch lyrics:", error.message);
            return null;
        }
    }
}

module.exports = Rest;
