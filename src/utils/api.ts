import axios from "axios";
import * as vscode from "vscode";

const endpointUrl = ""; // Use a site like https://render.com to store the api call to the database.

// Function to send session data
export async function sendSessionData(
    userId: string,
    username: string,
    duration: number,
    sessionDate: string,
    languages: Record<string, number>,
    streakData: {
        currentStreak: number;
        longestStreak: number
    }) {
    try {
        const response = await axios.post(`${endpointUrl}/coding-session`, {
            userId,
            username,
            duration,
            sessionDate,
            languages,
            streakData
        });
        console.log("<< Data sent successfully:", response.data);
    } catch (error) {
        console.error("<< Failed to send session data: ", error);
    }
}

// Check if a Discord user ID has a valid format (15-32 numeric digits)
function isValidDiscordId(userId: string): boolean {
    return /^\d{15,32}$/.test(userId);
}

// Validate the Discord user ID by checking both format and API verification
export async function checkAndValidateUserId(userId: string): Promise<boolean> {
    if (!isValidDiscordId(userId)) {
        vscode.window.showErrorMessage("<< Invalid Discord ID format | Enable Developer Mode In Discord And Try Again >>");
        return false;
    }

    try {
        const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot BOT_TOKEN` },
        });
        
        if (response.status === 200) {
            console.log("<< Discord ID is valid >>");
            return true;
        }
    } catch (error: any) {
        const status = error.response?.status;
        if (status === 401) {
            vscode.window.showErrorMessage("<< Unauthorized: Check bot token permissions >>");
        } else if (status === 404) {
            vscode.window.showErrorMessage("<< The Discord ID does not exist | Please enter a valid ID >>");
        } else {
            console.error("<< Error checking Discord ID:", error.response?.data || error.message);
            vscode.window.showErrorMessage("<< Error connecting to Discord API | Please try again later >>");
        }
    }
    return false;
}

// Function to fetch the username from the Discord API
export async function getDiscordUsername(userId: string): Promise<string | null> {
    try {
        if (userId === null) { return null;}

        const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot BOT_TOKEN` },
        });

        if (response.status === 200) {
            const username = response.data.username; // Assuming the API returns `username` in the response
            console.log(`<< Fetched Discord username: ${username} >>`);
            return username;
        }
    } catch (error: any) {
        const status = error.response?.status;
        if (status === 401) {
            vscode.window.showErrorMessage("<< Unauthorized: Check bot token permissions >>");
        } else if (status === 404) {
            vscode.window.showErrorMessage("<< The Discord ID does not exist | Please enter a valid ID >>");
        } else {
            console.error("<< Error fetching Discord username:", error.response?.data || error.message);
            vscode.window.showErrorMessage("<< Error connecting to Discord API | Please try again later >>");
        }
    }
    return null;
}

export async function getLeaderboard() {
    try {
        console.log("<< Fetching leaderboard... >>");
        const response = await axios.get(`${endpointUrl}/leaderboard`);
        return response.data;
    } catch (error) {
        console.error("<< Failed to fetch leaderboard:", error);
        return [];
    }
}

// New function to fetch user profile
export async function getUserProfile(userId: string) {
    try {
        const response = await axios.get(`${endpointUrl}/user-profile/${userId}`);
        return response.data;
    } catch (error) {
        console.error("<< Failed to fetch user profile:", error);
        return null;
    }
}

export async function getStreakData(userId: string) {
    try {
        const response = await axios.get(`${endpointUrl}/streak/${userId}`);
        return response.data;
    } catch (error) {
        console.error("<< Failed to fetch streak data:", error);
        return { currentStreak: 0, longestStreak: 0 };
    }
}

export async function getLanguageDurations(userId: string) {
    try {
        const response = await axios.get(`${endpointUrl}/languages/${userId}`);
        return response.data;
    } catch (error) {
        console.error("<< Failed to fetch language durations:", error);
        return {};
    }
}

export async function updateStreak(userId: string, newStreakData: {
    currentStreak: number;
    longestStreak: number;
}) {
    try {
        await axios.post(`${endpointUrl}/update-streak`, {
            userId,
            ...newStreakData
        });
    } catch (error) {
        console.error("<< Failed to update streak:", error);
    }
}
