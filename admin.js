document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Admin panel loaded!");

    const CONFIG = {
        SUPABASE: {
            URL: "https://smodsdsnswwtnbnmzhse.supabase.co/rest/v1",
            API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RzZHNuc3d3dG5ibm16aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjUyOTAsImV4cCI6MjA1NzIwMTI5MH0.zMdjymIaGU66_y6X-fS8nKnrWgJjXgw7NgXPBIzVCiI"
        },
        ADMIN_PASSWORD: "987412365"
    };

    const BLACKLIST_ID = 1; // ID of the blacklist row in Supabase
    let fetchedData = [];
    let blacklist = [];
    let isOnline = "offline"; // Change to string instead of boolean

    // Authenticate Admin
    async function authenticateUser() {
        const userPassword = prompt("🔒 Enter Admin Password:");
        if (userPassword === CONFIG.ADMIN_PASSWORD) {
            console.log("✅ Password correct, loading data...");
            await fetchSupabaseData();
            await fetchBlacklist();
            await fetchStatus();
        } else {
            alert("❌ Incorrect password! Reloading...");
            location.reload();
        }
    }

    // Fetch Supabase Data
    async function fetchSupabaseData() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/IC`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch data");

            fetchedData = await response.json();
            populateTable(fetchedData);

        } catch (error) {
            console.error("❌ Error fetching Supabase data:", error);
            alert("⚠️ Unable to fetch data from Supabase.");
        }
    }

    // Fetch Blacklist from Supabase
    async function fetchBlacklist() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?id=eq.${BLACKLIST_ID}&select=blacklist`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch blacklist data");

            const data = await response.json();
            if (data.length > 0) {
                blacklist = data[0].blacklist || [];
                console.log("📜 Current Blacklist:", blacklist);
            } else {
                console.log("❌ No blacklist found in Supabase.");
                blacklist = [];
            }
        } catch (error) {
            console.error("❌ Error fetching blacklist:", error);
            alert("⚠️ Unable to fetch blacklist.");
        }
    }

    // Add User to Blacklist
    async function addToBlacklist() {
        const userId = prompt("Enter the User ID to Blacklist:");
        if (!userId || blacklist.includes(userId)) {
            alert("⚠️ User already in blacklist or invalid input.");
            return;
        }

        blacklist.push(userId);

        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?id=eq.${BLACKLIST_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ blacklist })
            });

            if (!response.ok) throw new Error("⚠️ Failed to update blacklist");
            alert("✅ User added to blacklist!");
            console.log("📜 Updated Blacklist:", blacklist);

        } catch (error) {
            console.error("❌ Error updating blacklist:", error);
            alert("⚠️ Unable to update blacklist.");
        }
    }

    // Remove User from Blacklist
    async function removeFromBlacklist() {
        const userId = prompt("Enter the User ID to Remove from Blacklist:");
        if (!userId || !blacklist.includes(userId)) {
            alert("⚠️ User not found in blacklist.");
            return;
        }

        blacklist = blacklist.filter(id => id !== userId);

        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?id=eq.${BLACKLIST_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ blacklist })
            });

            if (!response.ok) throw new Error("⚠️ Failed to update blacklist");
            alert("✅ User removed from blacklist!");
            console.log("📜 Updated Blacklist:", blacklist);

        } catch (error) {
            console.error("❌ Error updating blacklist:", error);
            alert("⚠️ Unable to update blacklist.");
        }
    }

    // Fetch Status
    async function fetchStatus() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Status?id=eq.${BLACKLIST_ID}&select=status`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch status");

            const data = await response.json();
            // Update to handle string values
            if (data.length > 0) {
                isOnline = data[0].status;
                // Convert to string if it's still boolean
                if (typeof isOnline === 'boolean') {
                    isOnline = isOnline ? "online" : "offline";
                }
            } else {
                isOnline = "offline";
            }
            updateStatusDisplay();
function updateStatusDisplay() {
    const statusDisplay = document.getElementById("statusDisplay");
    if (isOnline === "online") {
        statusDisplay.textContent = "✅ Anketos atidarytos ✅"; // Custom text for online
        statusDisplay.classList.add("status-online");
        statusDisplay.classList.remove("status-offline");
    } else {
        statusDisplay.textContent = "❌ Anketos uždarytos ❌"; // Custom text for offline
        statusDisplay.classList.add("status-offline");
        statusDisplay.classList.remove("status-online");
    }
}

        } catch (error) {
            console.error("❌ Error fetching status:", error);
        }
    }

    // Toggle Status
    async function toggleStatus() {
        // Toggle between "online" and "offline" strings
        isOnline = isOnline === "online" ? "offline" : "online";
        updateStatusDisplay();

        try {
            await fetch(`${CONFIG.SUPABASE.URL}/Status?id=eq.${BLACKLIST_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ status: isOnline }) // Now sending "online" or "offline"
            });

            console.log(`🔄 Status changed to: ${isOnline}`);
        } catch (error) {
            console.error("❌ Error updating status:", error);
        }
    }

    function updateStatusDisplay() {
    const statusDisplay = document.getElementById("statusDisplay");
    if (isOnline === "online") {
        statusDisplay.textContent = "✅ Anketos atidarytos ✅"; // Custom text for online
    } else {
        statusDisplay.textContent = "❌ Anketos uždarytos ❌"; // Custom text for offline
    }
    // Update class logic based on string values
    statusDisplay.classList.toggle("status-online", isOnline === "online");
    statusDisplay.classList.toggle("status-offline", isOnline === "offline");
}


    // Populate Table
    function populateTable(data) {
        const dataTableBody = document.querySelector("#data-table tbody");
        dataTableBody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.USERIS}</td>
                <td>${item.VARDAS}</td>
                <td>${item.PAVARDĖ}</td>
                <td>${item["STEAM NICKAS"]}</td>
                <td><a href="${item["STEAM LINKAS"]}" target="_blank">🔗 Steam Profilis</a></td>
            `;
            dataTableBody.appendChild(row);
        });
    }

    // Event Listeners
    document.getElementById("statusButton").addEventListener("click", toggleStatus);
    document.getElementById("blacklistButton").addEventListener("click", addToBlacklist);
    document.getElementById("removeButton").addEventListener("click", removeFromBlacklist);

    // Authenticate and Load Data
    authenticateUser();
});
