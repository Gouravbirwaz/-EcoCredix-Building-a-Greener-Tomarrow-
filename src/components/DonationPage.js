import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Grid } from '@mui/material';
import { CreditCard, Lock } from '@mui/icons-material';

function DonationPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');

  const handleDonate = async () => {
    if (!name || !email || !amount) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      // 1. Call your backend to create a Razorpay order
      const res = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const orderData = await res.json();

      // 2. Razorpay checkout options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your frontend Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EcoConnect Donations",
        description: "Support environmental projects",
        order_id: orderData.id,
        handler: function (response) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // Optional: Save donor info and payment details to Firebase
        },
        prefill: {
          name,
          email,
        },
        theme: { color: "#2e7d32" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#e8f5e9', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#2e7d32', fontWeight: 700 }}>
        🌱 Donation Page
      </Typography>
      <Card sx={{ maxWidth: 800, margin: '0 auto', p: 3, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#004d40' }}>
            Support the Cause with Your Generosity
          </Typography>

          {/* Donor Information Section */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount (₹)"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                type="number"
                placeholder="Enter donation amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Credit Card Payment Section */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#004d40' }}>
            Payment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Card Number"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                placeholder="Enter your card number"
                InputProps={{
                  startAdornment: <CreditCard sx={{ color: '#004d40', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Expiry Date (MM/YY)"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CVV"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
                type="number"
                placeholder="CVV"
                InputProps={{
                  startAdornment: <Lock sx={{ color: '#004d40', mr: 1 }} />,
                }}
              />
            </Grid>
          </Grid>

          {/* Donate Button */}
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleDonate}
            sx={{ mt: 3, backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
          >
            Donate Now
          </Button>
        </CardContent>
      </Card>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </Box>
  );
}

export default DonationPage;
