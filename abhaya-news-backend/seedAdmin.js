const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({ email: "admin@abhayanews.com", password: hashedPassword });
    console.log("✅ Admin created");
    mongoose.disconnect();
});
