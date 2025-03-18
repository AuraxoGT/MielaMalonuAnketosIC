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
    const dataTableBody = document.querySelector("#data-table tbody");
    let fetchedData = [];
    let blacklist = [];

    // Authenticate Admin
    async function authenticateUser() {
        const userPassword = prompt("🔒 Enter Admin Password:");
        if (userPassword === CONFIG.ADMIN_PASSWORD) {
            console.log("✅ Password correct, loading data...");
            await fetchSupabaseData();
            await fetchBlacklist();
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

    // Fetch Blacklist
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
            blacklist = data.length > 0 ? data[0].blacklist : [];
            console.log("📜 Current Blacklist:", blacklist);

        } catch (error) {
            console.error("❌ Error fetching blacklist:", error);
            alert("⚠️ Unable to fetch blacklist.");
        }
    }

    // Update Blacklist
    async function updateBlacklist() {
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
            alert("✅ Blacklist updated!");
            console.log("📜 Updated Blacklist:", blacklist);

        } catch (error) {
            console.error("❌ Error updating blacklist:", error);
            alert("⚠️ Unable to update blacklist.");
        }
    }

    // Populate Table
    function populateTable(data) {
        dataTableBody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.USERIS}</td>
                <td>${item.VARDAS}</td>
                <td>${item.PAVARDĖ}</td>
                <td>${item["STEAM NICKAS"]}</td>
                <td><a href="${item["STEAM LINKAS"]}" target="_blank">🔗 Steam Profilis</a></td>
            `;
            dataTableBody.appendChild(row);
        });
    }

    // Search Filter
    document.getElementById("searchInput").addEventListener("input", function () {
        const searchInput = this.value.toLowerCase();

        const filteredData = fetchedData.filter(item =>
            Object.values(item).some(value =>
                value.toString().toLowerCase().includes(searchInput)
            )
        );

        populateTable(filteredData);
    });

    // Admin Panel - Status Control
    const statusButton = document.getElementById("statusButton");
    const statusDisplay = document.getElementById("statusDisplay");
    let isOnline = false;

    statusButton.addEventListener("click", function () {
        isOnline = !isOnline;
        statusDisplay.textContent = isOnline ? "ONLINE" : "OFFLINE";
        statusDisplay.classList.toggle("status-online", isOnline);
        statusDisplay.classList.toggle("status-offline", !isOnline);
        console.log(`🔄 Status changed: ${isOnline ? "Online" : "Offline"}`);
    });

    // Admin Panel - Add to Blacklist
    document.getElementById("blacklistButton").addEventListener("click", function () {
        const userId = prompt("Enter the User ID to Blacklist:");
        if (!userId || blacklist.includes(userId)) {
            alert("⚠️ User already in blacklist or invalid input.");
            return;
        }

        blacklist.push(userId);
        updateBlacklist();
    });

    // Admin Panel - Remove from Blacklist
    document.getElementById("removeButton").addEventListener("click", function () {
        const userId = prompt("Enter the User ID to Remove from Blacklist:");
        if (!userId || !blacklist.includes(userId)) {
            alert("⚠️ User not found in blacklist.");
            return;
        }

        blacklist = blacklist.filter(id => id !== userId);
        updateBlacklist();
    });

    // Authenticate and Load Data
    authenticateUser();
});
