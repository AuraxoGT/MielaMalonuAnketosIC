document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Admin panel loaded!");

    const CONFIG = {
        SUPABASE: {
            URL: "https://smodsdsnswwtnbnmzhse.supabase.co/rest/v1",  // Correct Supabase endpoint for REST API
            API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RzZHNuc3d3dG5ibm16aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjUyOTAsImV4cCI6MjA1NzIwMTI5MH0.zMdjymIaGU66_y6X-fS8nKnrWgJjXgw7NgXPBIzVCiI" // Replace with your actual Supabase API key
        },
        ADMIN_PASSWORD: "987412365" // Change this to your desired password
    };

    const dataTableBody = document.querySelector("#data-table tbody");
    let fetchedData = []; // Store fetched data globally

    // Ask for password only on page load
    async function authenticateUser() {
        const userPassword = prompt("🔒 Enter Admin Password:");

        if (userPassword === CONFIG.ADMIN_PASSWORD) {
            console.log("✅ Password correct, loading data...");
            await fetchSupabaseData(); // Fetch data after password check
        } else {
            alert("❌ Incorrect password! Reloading...");
            location.reload(); // Refresh the page if wrong password
        }
    }

    // Fetch Supabase Data
    async function fetchSupabaseData() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/status`, {
                method: "GET",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("⚠️ Failed to fetch data");

            fetchedData = await response.json(); // Store data globally
            populateTable(fetchedData); // Display data

        } catch (error) {
            console.error("❌ Error fetching Supabase data:", error);
            alert("⚠️ Unable to fetch data from Supabase.");
        }
    }

    // Populate Table with Data
    function populateTable(data) {
        dataTableBody.innerHTML = ""; // Clear table before adding new rows

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

    // Search & Filter Table (Updates live as you type)
    document.getElementById("searchInput").addEventListener("input", function () {
        const searchInput = this.value.toLowerCase();

        const filteredData = fetchedData.filter(item => 
            Object.values(item).some(value => 
                value.toString().toLowerCase().includes(searchInput)
            )
        );

        populateTable(filteredData); // Re-populate table with filtered results
    });

    // Update status
    async function updateStatus(status) {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/status?id=eq.1`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status
                })
            });

            if (!response.ok) throw new Error("⚠️ Failed to update status");

            const data = await response.json();
            console.log("✅ Status updated successfully:", data);
            document.getElementById("statusDisplay").textContent = status ? "Online" : "Offline";
            document.getElementById("statusDisplay").classList.toggle("status-online", status);
            document.getElementById("statusDisplay").classList.toggle("status-offline", !status);

        } catch (error) {
            console.error("❌ Error updating status:", error);
            alert("⚠️ Unable to update status.");
        }
    }

    // Toggle Status on button click
    document.getElementById("statusButton").addEventListener("click", async () => {
        const currentStatus = document.getElementById("statusDisplay").textContent === "Offline" ? false : true;
        const newStatus = !currentStatus;
        await updateStatus(newStatus);
    });

    // Add to blacklist
    async function addToBlacklist() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/blacklist`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    blacklist: JSON.stringify([1, 2, 3]) // Sample user IDs to be added to blacklist (adjust as needed)
                })
            });

            if (!response.ok) throw new Error("⚠️ Failed to add to blacklist");

            const data = await response.json();
            console.log("✅ Added to blacklist:", data);
        } catch (error) {
            console.error("❌ Error adding to blacklist:", error);
            alert("⚠️ Unable to add to blacklist.");
        }
    }

    // Remove from blacklist
    async function removeFromBlacklist() {
        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/blacklist`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    blacklist: JSON.stringify([1, 2]) // Sample user IDs to be removed from blacklist (adjust as needed)
                })
            });

            if (!response.ok) throw new Error("⚠️ Failed to remove from blacklist");

            const data = await response.json();
            console.log("✅ Removed from blacklist:", data);
        } catch (error) {
            console.error("❌ Error removing from blacklist:", error);
            alert("⚠️ Unable to remove from blacklist.");
        }
    }

    // Attach events to buttons
    document.getElementById("blacklistButton").addEventListener("click", addToBlacklist);
    document.getElementById("removeButton").addEventListener("click", removeFromBlacklist);

    // Authenticate once and fetch data
    authenticateUser();
});
