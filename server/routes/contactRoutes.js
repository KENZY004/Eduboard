const express = require('express');
const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Log the received message to the server console
        console.log(`\n📬 New Contact Form Submission:`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Message: ${message}\n`);

        // Send a success response back to the frontend
        res.status(200).json({ 
            success: true, 
            message: "Thank you! Your message has been received successfully." 
        });

    } catch (error) {
        console.error('Error in contact route:', error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

module.exports = router;