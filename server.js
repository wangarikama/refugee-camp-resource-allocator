const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());


// LIVE UNHCR API INTEGRATION


// Official UN API link for Kenya 2023
const unhcrApiUrl = "https://api.unhcr.org/population/v1/demographics/?limit=5000&coa=KEN&year=2023";

// THE ALARM CLOCK (Runs every night at midnight)
cron.schedule("0 0 * * *", async () => {
    console.log("[INFO] Pinging the official UNHCR servers...");
    try {
        const response = await axios.get(unhcrApiUrl);
        const records = response.data.items;

        if (!records || records.length === 0) return;

        let kenyaTotal = 0;
        records.forEach(row => {
            if (row.year == 2023) {
                kenyaTotal += (Number(row.f_total) || 0) + (Number(row.m_total) || 0);
            }
        });

        const totalPopulation = Math.floor(kenyaTotal * 0.40); // 40% for Kakuma

        if (totalPopulation > 0) {
            await db.query(
                "INSERT INTO population_stats (camp_location, total_refugees) VALUES ('Kakuma', ?) ON DUPLICATE KEY UPDATE total_refugees = ?",
                [totalPopulation, totalPopulation]
            );
            console.log(`[SUCCESS] Kakuma population synced: ${totalPopulation}`);
        }
    } catch (error) {
        console.error("[ERROR] UNHCR API Sync Failed.", error.message);
    }
});

// EMERGENCY MANUAL SYNC ROUTE 
app.get("/api/force-sync", async (req, res) => {
    console.log("[INFO] Force Sync Triggered...");
    try {
        const response = await axios.get(unhcrApiUrl);
        const records = response.data.items;
        let kenyaTotal = 0;
        records.forEach(row => {
            if (row.year == 2023) {
                kenyaTotal += (Number(row.f_total) || 0) + (Number(row.m_total) || 0);
            }
        });
        const totalPopulation = Math.floor(kenyaTotal * 0.40);

        await db.query(
            "INSERT INTO population_stats (camp_location, total_refugees) VALUES ('Kakuma', ?) ON DUPLICATE KEY UPDATE total_refugees = ?",
            [totalPopulation, totalPopulation]
        );

        res.json({ message: "Sync Successful!", population: totalPopulation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// REACT FRONTEND ROUTES


// 1. Read Inventory
app.get("/api/resources", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM resources");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch resources" });
    }
});

// 2. Advanced Gap Analysis 
app.get("/api/analysis/:camp", async (req, res) => {
  try {
    const { camp } = req.params;

    const [popRows] = await db.query(
      "SELECT total_refugees FROM population_stats WHERE camp_location = ? ORDER BY id DESC LIMIT 1",
      [camp]
    );

    if (popRows.length === 0) return res.status(404).json({ error: "Camp not found" });

    const totalRefugees = Number(popRows[0].total_refugees);
    const totalPupils = Math.floor(totalRefugees * 0.35); 
    const totalFamilies = Math.ceil(totalRefugees / 5);

    const [resourceRows] = await db.query("SELECT * FROM resources");

    const analysis = resourceRows.map((item) => {
      const quantityInStock = Number(item.quantity_in_stock);
      const unitPrice = Number(item.unit_price) || 0;
      const itemName = item.item_name.toLowerCase();
      
      // Initial default
      let requiredAmount = totalRefugees;

       // FOOD: Per Family
      if (item.sector === 'Food') {
        requiredAmount = totalFamilies;
      }

      // SHELTER: Per Family
      else if (item.sector === 'Shelter') {
        if (itemName.includes('tent') || itemName.includes('utensils') || itemName.includes('tarpaulin')) {
          requiredAmount = totalFamilies;
        } else {
          requiredAmount = totalRefugees; // Soap/Clothes stay per person
        }
      }

      // HEALTH: Realistic Medical Staffing & Supplies
      else if (item.sector === 'Health') {
        if (itemName.includes('doctor')) {
          requiredAmount = 20; 
        } else if (itemName.includes('nurse')) {
          requiredAmount = 40; 
        } else if (itemName.includes('cholera') || itemName.includes('malaria')) {
          requiredAmount = Math.ceil(totalRefugees / 100);
        } else if (itemName.includes('syringe') || itemName.includes('glove') || itemName.includes('coat')) {
          requiredAmount = Math.ceil(totalRefugees * 0.05);
        }
      }

      // EDUCATION: Based on Pupils
      else if (item.sector === 'Education') {
        if (itemName.includes('school tent')) {
            requiredAmount = Math.ceil(totalPupils / 50); // 1 School Tent per 50 pupils
        } else if (itemName.includes('teacher')) {
            requiredAmount = 100; // Fixed staff cap
        } else if (itemName.includes('chalkboard')) {
            requiredAmount = 10; // Fixed camp requirement
        } else if (itemName.includes('notebook') || itemName.includes('pen') || itemName.includes('textbook')) {
            requiredAmount = totalPupils; // 1 per student
        }
    }

    const gap = quantityInStock - requiredAmount;
    const gapCost = gap < 0 ? Math.abs(gap) * unitPrice : 0;

    return {
        id: item.id,
        sector: item.sector,
        item_name: item.item_name,
        quantity_in_stock: quantityInStock,
        required_amount: requiredAmount,
        gap,
        status: gap < 0 ? "Critical Shortage" : "Sufficient",
        unit_price: unitPrice,
        gap_cost: gapCost
    };
});

    return res.json({ camp, total_refugees: totalRefugees, total_pupils: totalPupils, items: analysis });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate gap analysis" });
  }
});

// 3. Update Stock 
app.put("/api/resources/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity_in_stock } = req.body;
        await db.query("UPDATE resources SET quantity_in_stock = ? WHERE id = ?", [quantity_in_stock, id]);
        res.json({ message: "Stock updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update stock" });
    }
});

// 4. Update Population (The Admin Override)
app.put("/api/population/:camp", async (req, res) => {
    try {
        const { camp } = req.params;
        const { total_refugees } = req.body;
        await db.query("UPDATE population_stats SET total_refugees = ? WHERE camp_location = ?", [total_refugees, camp]);
        res.json({ message: "Population updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update population" });
    }
});


// START SERVER

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`[INFO] Server listening on port ${PORT}`));