const fs     = require('fs');
const csv    = require('csv-parser');
const Lead   = require('../models/leadModel');
const Import = require('../models/importModel');

// POST /api/imports  — upload CSV, bulk-create leads
const importLeads = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });

  const results  = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const cleaned = {
        name:    row.name    || row.Name    || row['Contact Name'] || row.contactPerson,
        email:   row.email   || row.Email,
        phone:   row.phone   || row.Phone   || row.Mobile || '',
        company: row.company || row.Company || row.CompanyName || row.company_name || '',
        source:  row.source  || row.Source  || 'CSV Import'
      };
      if (cleaned.name || cleaned.email) results.push(cleaned);
    })
    .on('end', async () => {
      try {
        let count = 0;
        for (const row of results) {
          try {
            await Lead.create({
              company_id:  req.user.company_id,
              name:        row.name,
              email:       row.email,
              phone:       row.phone,
              company:     row.company,
              source:      row.source,
              status:      'New',
              created_by:  req.user.id
            });
            count++;
          } catch (e) {
            console.error('Import row error:', row.name || row.email, e.message);
          }
        }

        // Record import history
        await Import.create({
          company_id:    req.user.company_id,
          file_name:     req.file.originalname,
          imported_by:   req.user.id,
          total_records: count
        });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ message: `Successfully imported ${count} leads`, count, total_processed: results.length });
      } catch (e) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Server error during import', error: e.message });
      }
    })
    .on('error', () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
};

// GET /api/imports
const getImportHistory = async (req, res) => {
  try {
    const history = await Import.findAll(req.user.company_id);
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { importLeads, getImportHistory };
