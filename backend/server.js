const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/companies',      require('./routes/companies'));
app.use('/api/leads',          require('./routes/leads'));
app.use('/api/custom-fields',  require('./routes/customFields'));
app.use('/api/audiences',      require('./routes/audiences'));
app.use('/api/email-templates',require('./routes/emailTemplates'));
app.use('/api/emails',         require('./routes/emails'));
app.use('/api/imports',        require('./routes/imports'));
app.use('/api/lead-templates', require('./routes/leadTemplates'));
app.use('/api/activities',     require('./routes/activities'));
app.use('/api/users',          require('./routes/users'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'LeadSphere CRM API — company-wise v2.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
