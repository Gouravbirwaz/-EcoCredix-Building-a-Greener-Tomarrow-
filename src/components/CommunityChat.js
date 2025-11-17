// src/components/CommunityChat.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  IconButton,
  Typography,
  Divider,
  Button,
  Chip,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { database, auth, ref, push, set } from '../firebase';
import { onValue } from 'firebase/database';

const ROOMS = [
  { id: 'general', label: 'General' },
  { id: 'ecoTips', label: 'Eco Tips' },
  { id: 'events', label: 'Events' },
  { id: 'help', label: 'Help' },
];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(Number(ts));
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CommunityChat({ defaultRoom = 'general' }) {
  const [selectedRoom, setSelectedRoom] = useState(defaultRoom);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [userMeta, setUserMeta] = useState({ uid: null, name: 'Anonymous', avatar: '' });
  const listRef = useRef(null);

  useEffect(() => {
    try {
      const storedUid = localStorage.getItem('uid');
      const displayName = localStorage.getItem('username');
      const avatar = localStorage.getItem('avatarUrl');
      if (storedUid) setUserMeta({ uid: storedUid, name: displayName || 'User', avatar });
      if (auth.currentUser) {
        const u = auth.currentUser;
        setUserMeta({ uid: u.uid, name: u.displayName || u.email || 'User', avatar: u.photoURL });
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    const roomRef = ref(database, `communityChats/${selectedRoom}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arr = Object.keys(data)
        .map((id) => ({ id, ...data[id] }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(arr);
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 80);
    });

    return () => unsub();
  }, [selectedRoom]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const roomRef = ref(database, `communityChats/${selectedRoom}`);
      const msgRef = push(roomRef);

      await set(msgRef, {
        userId: userMeta.uid,
        username: userMeta.name,
        avatar: userMeta.avatar,
        text: text.trim(),
        timestamp: Date.now(),
      });
      setText('');
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Message failed to send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 480 }}>
      {/* Rooms */}
      <Box sx={{ width: { xs: '100%', md: 260 }, borderRight: { md: '1px solid #eee' }, p: 2 }}>
        <Typography variant="h6">Community Rooms</Typography>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {ROOMS.map((room) => (
            <Button
              key={room.id}
              variant={selectedRoom === room.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedRoom(room.id)}
              sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
            >
              <Chip label={room.label} size="small" sx={{ mr: 1 }} />
              {room.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">#{selectedRoom}</Typography>
          <Typography variant="body2" color="text.secondary">{messages.length} messages</Typography>
        </Box>

        <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {messages.map((msg) => (
              <ListItem key={msg.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={msg.avatar}>{!msg.avatar && msg.username?.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{msg.username}</Typography>
                      <Typography variant="caption">{formatTime(msg.timestamp)}</Typography>
                    </Box>
                  }
                  secondary={
                    <Typography sx={{
                      background: '#fff',
                      padding: 1,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}>
                      {msg.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid #ddd', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
          />
          <IconButton color="primary" disabled={!text.trim() || sending} onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
