document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ Admin panel loaded!");

    const CONFIG = {
        SUPABASE: {
            URL: "https://smodsdsnswwtnbnmzhse.supabase.co/rest/v1",
            API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RzZHNuc3d3dG5ibm16aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjUyOTAsImV4cCI6MjA1NzIwMTI5MH0.zMdjymIaGU66_y6X-fS8nKnrWgJjXgw7NgXPBIzVCiI"
        },
        ADMIN_PASSWORD: "987412365"
    };

    const BLACKLIST_ID = 1;
    let fetchedData = [];
    let blacklist = [];
    let isOnline = "offline";

    // Don't blur on page load - we'll add blur when prompting for password
    
    // Create authorization overlay
    function createAuthorizationOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'authorization-overlay';
        overlay.innerHTML = '<div class="container"><h2>Admin Authentication Required</h2><p>Please enter your admin password to continue.</p></div>';
        document.body.appendChild(overlay);
        return overlay;
    }

    // Authentication logic
    async function authenticateUser() {
        // Add blur BEFORE showing the password prompt
        document.body.classList.add('blurred-content');
        
        const authOverlay = createAuthorizationOverlay();
        const userPassword = prompt("🔒 Iveskite admin password:");
        
        if (userPassword === CONFIG.ADMIN_PASSWORD) {
            console.log("✅ Password correct, loading data...");
            
            try {
                // Load all data first
                await Promise.all([
                    fetchSupabaseData(),
                    fetchBlacklist(),
                    fetchStatus()
                ]);
                
                // Then remove blur and overlay once everything is loaded
                document.body.classList.remove('blurred-content');
                if (authOverlay) {
                    authOverlay.remove();
                }
                
                console.log("✅ Authentication successful and data loaded!");
            } catch (error) {
                console.error("❌ Error loading data:", error);
                alert("⚠️ Error loading data. Please try again.");
                location.reload();
            }
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
            return fetchedData;

        } catch (error) {
            console.error("❌ Error fetching Supabase data:", error);
            alert("⚠️ Unable to fetch data from Supabase.");
            throw error;
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
            return blacklist;
        } catch (error) {
            console.error("❌ Error fetching blacklist:", error);
            alert("⚠️ Unable to fetch blacklist.");
            throw error;
        }
    }

    // Add User to Blacklist
    async function addToBlacklist() {
        const userId = prompt("Enter the User ID to Blacklist:");
        if (!userId) {
            alert("⚠️ Invalid input.");
            return;
        }
        
        if (blacklist.includes(userId)) {
            alert("⚠️ User already in blacklist.");
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
        if (!userId) {
            alert("⚠️ Invalid input.");
            return;
        }
        
        if (!blacklist.includes(userId)) {
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
            return isOnline;
        } catch (error) {
            console.error("❌ Error fetching status:", error);
            throw error;
        }
    }

    // Update Status Display
    function updateStatusDisplay() {
        const statusDisplay = document.getElementById("statusDisplay");
        if (statusDisplay) {
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
    }

    // Toggle Status
    async function toggleStatus() {
        // Toggle between "online" and "offline" strings
        isOnline = isOnline === "online" ? "offline" : "online";
        updateStatusDisplay();

        try {
            const response = await fetch(`${CONFIG.SUPABASE.URL}/Status?id=eq.${BLACKLIST_ID}`, {
                method: "PATCH",
                headers: {
                    "apikey": CONFIG.SUPABASE.API_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ status: isOnline }) // Now sending "online" or "offline"
            });

            if (!response.ok) throw new Error("⚠️ Failed to update status");
            console.log(`🔄 Status changed to: ${isOnline}`);
        } catch (error) {
            console.error("❌ Error updating status:", error);
            alert("⚠️ Unable to update status.");
        }
    }

    // Populate Table
    function populateTable(data) {
        const dataTableBody = document.querySelector("#data-table tbody");
        if (!dataTableBody) {
            console.error("❌ Could not find table body element");
            return;
        }
        
        dataTableBody.innerHTML = "";

        data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}.</td> <!-- Row number -->
                <td><span class="copy-text" data-copy="${item.DISCORD_ID || ''}">${item.DISCORD_ID || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.USERIS || ''}">${item.USERIS || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.VARDAS || ''}">${item.VARDAS || ''}</span></td>
                <td><span class="copy-text" data-copy="${item.PAVARDĖ || ''}">${item.PAVARDĖ || ''}</span></td>
                <td><span class="copy-text" data-copy="${item["STEAM NICKAS"] || ''}">${item["STEAM NICKAS"] || ''}</span></td>
                <td>
                  <a href="${item["STEAM LINKAS"] || '#'}" target="_blank">🔗 Steam Profilis</a>
                  <span class="copy-text" data-copy="${item["STEAM LINKAS"] || ''}">📋</span>
                </td>
            `;
            dataTableBody.appendChild(row);
        });
        
        // Add event listeners to all copy text elements
        document.querySelectorAll('.copy-text').forEach(element => {
            element.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                if (!textToCopy) return;
                
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Visual feedback
                        const originalText = this.textContent;
                        this.classList.add('copy-flash');
                        
                        // Only change text content if it's not the clipboard icon
                        if (this.textContent !== '📋') {
                            this.setAttribute('data-original-text', originalText);
                            this.textContent = 'Nukopijuota ✅';
                        } else {
                            this.textContent = '✓';
                        }
                        
                        setTimeout(() => {
                            this.classList.remove('copy-flash');
                            
                            // Restore original text if it was changed
                            if (this.hasAttribute('data-original-text')) {
                                this.textContent = this.getAttribute('data-original-text');
                                this.removeAttribute('data-original-text');
                            } else if (this.textContent === '✓') {
                                this.textContent = '📋';
                            }
                        }, 1000);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                    });
            });
        });
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", function() {
                const searchTerm = this.value.toLowerCase();
                
                if (!fetchedData || !Array.isArray(fetchedData)) {
                    console.error("❌ No data available for search");
                    return;
                }

                const filteredData = fetchedData.filter(item => 
                    Object.values(item).some(value => 
                        value && value.toString().toLowerCase().includes(searchTerm)
                    )
                );

                populateTable(filteredData); // Re-populate table with filtered results
            });
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        const statusButton = document.getElementById("statusButton");
        const blacklistButton = document.getElementById("blacklistButton");
        const removeButton = document.getElementById("removeButton");

        if (statusButton) {
            statusButton.addEventListener("click", toggleStatus);
        }
        
        if (blacklistButton) {
            blacklistButton.addEventListener("click", addToBlacklist);
        }
        
        if (removeButton) {
            removeButton.addEventListener("click", removeFromBlacklist);
        }
    }

    // Initialize the application
    function init() {
        setupEventListeners();
        setupSearch();
        authenticateUser(); // Start authentication process
    }

    // Start the application
    init();
});
