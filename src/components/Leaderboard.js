// src/components/Leaderboard.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Paper,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Divider,
  Skeleton
} from "@mui/material";
import { Star, MilitaryTech, EmojiEvents } from "@mui/icons-material";
import { database } from "../firebase"; // your project already uses this pattern
import { ref, onValue } from "firebase/database";

/*
  Leaderboard expectations (Realtime DB):
  users/
    <userId>/
      username: "Rohan"
      avatarUrl: "https://..."
      credits: 120
      challengesJoined: 3
      reels:
        <reelId>:
          views: 1200
          likes: 34
*/

function computeReelsImpact(reelsObj = {}) {
  let totalViews = 0;
  let totalLikes = 0;
  Object.values(reelsObj).forEach((r) => {
    totalViews += Number(r.views || 0);
    totalLikes += Number(r.likes || 0);
  });
  // simple combined metric
  return totalLikes + totalViews / 10;
}

function computeEcoScore({ credits = 0, reelsImpact = 0, challengesJoined = 0 }) {
  // Keep this consistent with the plan. Adjust weights here if you want.
  return credits * 2 + reelsImpact * 1.5 + challengesJoined * 10;
}

const TopCard = ({ rank, user }) => {
  const colors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze
  const accent = colors[Math.min(rank - 1, 2)];
  return (
    <Paper sx={{ p: 2, borderRadius: 3, textAlign: "center", background: `linear-gradient(180deg, ${accent}22, #fff)` }}>
      <Box sx={{ display: "flex", justifyContent: "center", mt: -6 }}>
        <Avatar sx={{ width: 96, height: 96, border: `4px solid ${accent}` }} src={user.avatarUrl || ""}>
          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
        </Avatar>
      </Box>
      <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
        #{rank} {user.username || "Unknown"}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#555" }}>
        {user.ecoScore} pts
      </Typography>

      {/* Badges preview */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 1 }}>
        {user.credits >= 100 && <Chip label="🌱 Eco Veteran" size="small" />}
        {(user.reelsCount || 0) >= 5 && <Chip label="🎥 Influencer" size="small" />}
        {(user.challengesJoined || 0) >= 10 && <Chip label="🏅 Challenger" size="small" />}
      </Box>

      {/* XP bar */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: "#333" }}>
          XP Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min((user.ecoScore % 200) / 2, 100)}
          sx={{ height: 12, borderRadius: 2, mt: 1 }}
        />
      </Box>
    </Paper>
  );
};

export default function Leaderboard() {
  const [users, setUsers] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // if you want to highlight logged-in user

  useEffect(() => {
    // optionally get logged-in user id from local storage or firebase auth
    try {
      const storedUid = localStorage.getItem("uid") || null;
      if (storedUid) setCurrentUserId(storedUid);
    } catch (e) {}

    const usersRef = ref(database, "users");
    const unsub = onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([uid, u]) => {
        const reelsImpact = computeReelsImpact(u.reels);
        const reelsCount = u.reels ? Object.keys(u.reels).length : 0;
        const challengesJoined = Number(u.challengesJoined || u.challenges || 0);
        const credits = Number(u.credits || 0);

        const ecoScore = Math.round(computeEcoScore({ credits, reelsImpact, challengesJoined }));

        return {
          uid,
          username: u.username || u.displayName || "User",
          avatarUrl: u.avatarUrl || u.photoURL || "",
          credits,
          reelsImpact: Math.round(reelsImpact),
          reelsCount,
          challengesJoined,
          ecoScore,
        };
      });

      // sort by ecoScore desc
      arr.sort((a, b) => b.ecoScore - a.ecoScore);
      setUsers(arr);
    });

    return () => unsub();
  }, []);

  if (!users) {
    // loading skeleton
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>Leaderboard</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={220} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={220} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={220} /></Grid>
        </Grid>
      </Container>
    );
  }

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const totalUsers = users.length;
  const currentUserPosition = users.findIndex(u => u.uid === currentUserId) + 1; // 0 -> -1

  return (
    <Container sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}>
        🏆 EcoConnect Leaderboard
      </Typography>

      {/* Top 3 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {top3.map((u, idx) => (
          <Grid item xs={12} md={4} key={u.uid}>
            <TopCard rank={idx + 1} user={u} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Full Rankings</Typography>
          <Box>
            <Chip icon={<EmojiEvents />} label={`Total users: ${totalUsers}`} sx={{ mr: 1 }} />
            {currentUserPosition > 0 ? (
              <Chip label={`You are #${currentUserPosition}`} color="primary" />
            ) : (
              <Chip label={`You are unranked`} />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell>EcoScore</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Reels</TableCell>
              <TableCell>Challenges</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u, i) => (
              <TableRow key={u.uid} selected={u.uid === currentUserId}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={u.avatarUrl} sx={{ width: 36, height: 36 }} />
                  <Typography sx={{ fontWeight: 600 }}>{u.username}</Typography>
                  {i === 0 && <Star sx={{ color: "#FFD700", ml: 1 }} />}
                  {i === 1 && <MilitaryTech sx={{ color: "#C0C0C0", ml: 1 }} />}
                  {i === 2 && <EmojiEvents sx={{ color: "#CD7F32", ml: 1 }} />}
                </TableCell>
                <TableCell>{u.ecoScore}</TableCell>
                <TableCell>{u.credits}</TableCell>
                <TableCell>{u.reelsCount} ({u.reelsImpact})</TableCell>
                <TableCell>{u.challengesJoined}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => window.location.assign(`/profile/${u.uid}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
