// GoogleLoginGemini.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button, Avatar, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function GoogleLoginGemini() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("🔐 Google Access Token:", tokenResponse.access_token);

      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const user = res.data;

        console.log("🟢 Đăng nhập thành công:");
        console.log(`👤 Tên: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🖼️ Ảnh đại diện: ${user.picture}`);

        setUserInfo(user);
        navigate('/calendar');
      } catch (err) {
        console.error("❌ Lỗi khi lấy thông tin người dùng:", err);
        alert("Không thể lấy thông tin người dùng từ Google.");
      }
    },
    onError: () => {
      console.log('❌ Google Login Failed');
      alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    },
    scope: 'openid email profile',
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>

      <Button
        onClick={login}
        startIcon={<GoogleIcon />}
        variant="contained"
        sx={{
          backgroundColor: '#db4437',
          '&:hover': {
            backgroundColor: '#c33d2e',
          },
          color: '#fff',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          px: 3,
          py: 1.2,
        }}
      >
        Login with Google
      </Button>

      {userInfo && (
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mt={2}
          p={2}
          bgcolor="rgba(240,240,240,0.85)"
          borderRadius={2}
        >
          <Avatar alt={userInfo.name} src={userInfo.picture} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {userInfo.name}
            </Typography>
            <Typography variant="body2">{userInfo.email}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default GoogleLoginGemini;
