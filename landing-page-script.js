/**
 * Landing Page Script for CRM Integration
 * 
 * This script should be placed on your landing page at:
 * https://vpragadeesh.github.io/viewer/
 * 
 * It handles:
 * 1. Personalization based on URL parameters
 * 2. Tracking visit and triggering LEAD → MQL conversion
 * 3. Sending data back to the CRM backend
 */

// Configuration - Update this to your backend URL
const CRM_BACKEND_URL = "http://localhost:3000"; // Change to your deployed backend URL when in production

// Utility to get query params
function getParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Read values from URL
const contactId = getParam("cid");
const name = getParam("name");
const token = getParam("token");

// Personalize UI
if (name) {
  const headline = document.getElementById("headline");
  const subtext = document.getElementById("subtext");
  
  if (headline) {
    headline.innerText = `Hey ${decodeURIComponent(name)} 👋`;
  }
  if (subtext) {
    subtext.innerText = "Thanks for checking out this personalized page. We're excited to connect with you!";
  }
}

// Track visit and trigger LEAD → MQL conversion (ONLY ONCE PER SESSION)
if (contactId && !sessionStorage.getItem(`visited_${contactId}`)) {
  // Mark as visited in this session
  sessionStorage.setItem(`visited_${contactId}`, "true");
  
  // Send tracking data to CRM backend
  fetch(`${CRM_BACKEND_URL}/api/track/visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contactId: contactId,
      token: token,
      name: name ? decodeURIComponent(name) : null,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || null,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ Visit tracked successfully:", data);
      if (data.converted) {
        console.log("🎉 Lead converted to MQL!");
      }
    })
    .catch((error) => {
      console.error("❌ Failed to track visit:", error);
    });
}
