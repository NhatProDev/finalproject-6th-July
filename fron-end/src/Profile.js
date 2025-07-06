import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
  Paper,
} from '@mui/material';

function Profile() {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg">
      {/* Cover Image */}
      <Box
        sx={{
          position: 'relative',
          height: 220,
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/1/17/Bundesarchiv_Bild_183-S33882%2C_Adolf_Hitler.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '0 0 16px 16px',
        }}
      />

      {/* Avatar & Info */}
      <Grid container spacing={2} sx={{ mt: -8, px: 2, alignItems: 'center' }}>
        <Grid item>
          <Avatar
            alt="Adolf"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bundesarchiv_Bild_183-S33882%2C_Adolf_Hitler.jpg/800px-Bundesarchiv_Bild_183-S33882%2C_Adolf_Hitler.jpg"
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
            }}
          />
        </Grid>
        <Grid item xs>
          <Typography variant="h5" fontWeight="bold">
            Adolf
          </Typography>
          <Button variant="outlined" sx={{ mt: 1 }}>
            Add Friend
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Posts" />
        <Tab label="Friends" />
        <Tab label="Projects" />
      </Tabs>

      {/* Bio & Post */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Bio</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                From <strong>Hanoi, Viet Nam</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bundesarchiv_Bild_183-S33882%2C_Adolf_Hitler.jpg/800px-Bundesarchiv_Bild_183-S33882%2C_Adolf_Hitler.jpg"
                sx={{ width: 50, height: 50, mr: 2 }}
              />
              <Box>
                <Typography fontWeight="bold">Adolf</Typography>
                <Typography variant="caption">At 9:52 AM 3/7/2025</Typography>
              </Box>
            </Box>
            <Typography>
              Hey I have found this calendar template is useful very much!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
