document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Admin panel loaded!");

    const CONFIG = {
        SUPABASE: {
            URL: "https://smodsdsnswwtnbnmzhse.supabase.co/rest/v1",
            API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RzZHNuc3d3dG5ibm16aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjUyOTAsImV4cCI6MjA1NzIwMTI5MH0.zMdjymIaGU66_y6X-fS8nKnrWgJjXgw7NgXPBIzVCiI"
        },
        ADMIN_PASSWORD: "987412365"
    };

    const dataTableBody = document.querySelector("#data-table tbody");
    let fetchedData = [];
    let blacklist = [];

    // Authenticate on page load
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

    // Fetch Data from Supabase
    async function fetchSupabaseData() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/IC?select=*`, {
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

    // Fetch Blacklist Data
    async function fetchBlacklist() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?select=blacklist_data`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch blacklist data");

            const data = await response.json();
            blacklist = data.length > 0 ? JSON.parse(data[0].blacklist_data) : [];

        } catch (error) {
            console.error("❌ Error fetching Supabase blacklist:", error);
            alert("⚠️ Unable to fetch blacklist data.");
        }
    }

    // Populate Table
    function populateTable(data) {
        dataTableBody.innerHTML = "";
        data.forEach(item => {
            const isBlacklisted = blacklist.includes(item.id);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.USERIS}</td>
                <td>${item.VARDAS}</td>
                <td>${item.PAVARDĖ}</td>
                <td>${item["STEAM NICKAS"]}</td>
                <td><a href="${item["STEAM LINKAS"]}" target="_blank">🔗 Steam Profilis</a></td>
                <td>${isBlacklisted ? "🚫 Blacklisted" : "✅ Active"}</td>
                <td>
                    <button onclick="toggleStatus('${item.id}', '${item.status}')">🔄 Change Status</button>
                    <button onclick="addToBlacklist('${item.id}')">🚫 Blacklist</button>
                    <button onclick="removeFromBlacklist('${item.id}')">✅ Remove Blacklist</button>
                </td>
            `;
            dataTableBody.appendChild(row);
        });
    }

    // Toggle User Status
    async function toggleStatus(userId, currentStatus) {
        const newStatus = currentStatus === "online" ? "offline" : "online";
        await updateUser(userId, { status: newStatus });
    }

    // Add to Blacklist (Update JSON String)
    async function addToBlacklist(userId) {
        if (!blacklist.includes(userId)) {
            blacklist.push(userId);
            await updateBlacklist(blacklist);
        }
    }

    // Remove from Blacklist (Update JSON String)
    async function removeFromBlacklist(userId) {
        blacklist = blacklist.filter(id => id !== userId);
        await updateBlacklist(blacklist);
    }

    // Update Blacklist in Supabase
    async function updateBlacklist(newBlacklist) {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Blacklist?id=eq.1`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ blacklist_data: JSON.stringify(newBlacklist) })
            });

            if (!response.ok) throw new Error("⚠️ Failed to update blacklist");
            alert("✅ Blacklist updated!");
            fetchSupabaseData();

        } catch (error) {
            console.error("❌ Error updating Supabase blacklist:", error);
            alert("⚠️ Unable to update blacklist.");
        }
    }

    authenticateUser();
});
