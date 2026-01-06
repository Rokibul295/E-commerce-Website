const connectDB = require('../config/database');
const User = require('../models/User');

const email = process.argv[2];
const status = process.argv[3];

if (!email || !status) {
  console.error('Usage: node updateStatus.js <email> <status>');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    const u = await User.findOneAndUpdate({ email }, { status }, { new: true });
    console.log('Updated user:', u ? `${u.email} -> ${u.status}` : 'User not found');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
