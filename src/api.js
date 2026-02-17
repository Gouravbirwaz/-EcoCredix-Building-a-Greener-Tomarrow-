import axios from 'axios';
// Import Firestore modules from your firebase.js
import { db } from './firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


// --- 1. Environmental Data Fetcher ---

/**
 * Fetches environmental data for a given location from an external API.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<object | null>} Environmental data object or null on failure.
 */

export const fetchEnvironmentalData = async (latitude, longitude) => {
    // IMPORTANT: Ensure you have set this key in your project's environment variables.
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
    // NOTE: Replace this with the actual API endpoint for environmental data.
    const apiUrl = 'https://gemini-api-url/environment-data'; 

    try {
        const response = await axios.post(apiUrl, { latitude, longitude }, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        
        console.log('Successfully fetched environmental data.');
        return response.data;

    } catch (error) {
        console.error('Error fetching environmental data:', error.response?.data || error.message);
        // We return null so the issue can still be submitted even if the data fetch fails.
        return null;
    }
};


// --- 2. Issue Report Submitter (Firestore) ---

/**
 * Submits an issue report to the 'issues' collection in Firestore.
 * This function also attempts to fetch environmental data if a location is provided.
 * * @param {object} reportData - The data from the IssueReportingPage form.
 * @returns {Promise<void>}
 */

export const submitIssueReport = async (reportData) => {
    // Ensure we have a database connection
    if (!db) {
        throw new Error("Firestore database connection not initialized.");
    }

    let environmentalDetails = null;

    // STEP A: If a location is pinned, fetch the environmental data first.
    if (reportData.location) {
        environmentalDetails = await fetchEnvironmentalData(
            reportData.location.lat, 
            reportData.location.lng
        );
    }
    
    // STEP B: Write the complete report to Firestore.
    try {
        const issuesCollectionRef = collection(db, 'issues');
        
        const docRef = await addDoc(issuesCollectionRef, {
            issueName: reportData.issueName,
            description: reportData.description,
            location: reportData.location || null, // Optional coordinates
            environmentalDetails: environmentalDetails, // New optional data
            reporterUid: reportData.reporterUid,
            reporterEmail: reportData.reporterEmail,
            status: 'New', 
            createdAt: serverTimestamp(), 
        });

        console.log("Document successfully written with ID: ", docRef.id);

    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error(`Failed to submit issue: ${e.message}`);
    }
};